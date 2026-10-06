import type { RequestHandler } from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { GoalStore } from '../src/db.js';
import { isoWeek } from '../src/dates.js';
import type { Mailer } from '../src/mailer.js';

const NOW = new Date('2026-03-18T12:00:00Z');

/** Test auth: the `x-test-user` header signs in as that Auth0 subject. */
const fakeAuth: RequestHandler = (req, res, next) => {
  const sub = req.get('x-test-user');
  (req as any).oidc = {
    user: sub ? { sub, nickname: sub, name: sub, email: `${sub}@example.com` } : undefined,
  };
  (res as any).oidc = { login: ({ returnTo }: { returnTo: string }) => res.redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`) };
  next();
};

const goal = (due: string, extra: Record<string, string> = {}) => ({
  name: 'Training',
  'items[0][exercise]': 'Running',
  'items[0][activity]': '5 km',
  'items[0][dueDate]': due,
  ...extra,
});

describe('app', () => {
  let store: GoalStore;
  let sent: Parameters<Mailer['send']>[0][];
  let app: ReturnType<typeof createApp>;
  const as = (user: string) => ({ 'x-test-user': user });

  beforeEach(() => {
    store = new GoalStore(':memory:', () => NOW);
    sent = [];
    app = createApp({
      config: { BASE_URL: 'http://localhost', TRUST_PROXY: false },
      store,
      mailer: { send: async (m) => void sent.push(m) },
      authMiddleware: fakeAuth,
      now: () => NOW,
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('serves the landing page to anonymous visitors', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Log in to get started');
  });

  it('redirects anonymous users to login for protected pages', async () => {
    const res = await request(app).get('/goals');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/login?returnTo=%2Fgoals');
  });

  it('creates a goal and lists it with derived status and week', async () => {
    await request(app).post('/goals').set(as('ann')).type('form').send(goal('2026-03-20')).expect(303);
    const res = await request(app).get('/goals').set(as('ann'));
    expect(res.text).toContain('Training');
    expect(res.text).toContain('Active');
    expect(res.text).toContain('Week 12');
  });

  it('marks goals past their end date as overdue', async () => {
    await request(app).post('/goals').set(as('ann')).type('form').send(goal('2026-03-01'));
    const res = await request(app).get('/goals?status=overdue').set(as('ann'));
    expect(res.text).toContain('Training');
    expect((await request(app).get('/goals?status=active').set(as('ann'))).text).not.toContain('Training');
  });

  it('completes goals', async () => {
    await request(app).post('/goals').set(as('ann')).type('form').send(goal('2026-03-20'));
    await request(app).post('/goals/1/complete').set(as('ann')).expect(303);
    expect(store.get('ann', 1)?.status).toBe('complete');
  });

  it("keeps users' goals private", async () => {
    await request(app).post('/goals').set(as('ann')).type('form').send(goal('2026-03-20'));
    await request(app).get('/goals/1/edit').set(as('bob')).expect(404);
    await request(app).post('/goals/1/delete').set(as('bob')).expect(404);
    await request(app).post('/goals/1/complete').set(as('bob')).expect(404);
    await request(app).post('/goals/1/share').set(as('bob')).type('form').send({ recipient: 'x@y.com' }).expect(404);
    expect(store.get('ann', 1)?.status).toBe('active');
    expect((await request(app).get('/goals').set(as('bob'))).text).not.toContain('Training');
  });

  it('does not allow state changes via GET', async () => {
    await request(app).post('/goals').set(as('ann')).type('form').send(goal('2026-03-20'));
    await request(app).get('/goals/1/delete').set(as('ann')).expect(404);
    expect(store.get('ann', 1)).toBeDefined();
  });

  it('rejects cross-site posts', async () => {
    await request(app).post('/goals').set(as('ann')).set('Origin', 'https://evil.example').type('form').send(goal('2026-03-20')).expect(403);
    expect(store.list('ann')).toHaveLength(0);
  });

  it('rejects opaque origins with 403, not a crash', async () => {
    await request(app).post('/goals').set(as('ann')).set('Origin', 'null').type('form').send(goal('2026-03-20')).expect(403);
  });

  it('accepts same-origin posts that carry an Origin header', async () => {
    await request(app).post('/goals').set(as('ann')).set('Host', 'localhost').set('Origin', 'http://localhost').type('form').send(goal('2026-03-20')).expect(303);
  });

  it('validates the goal form', async () => {
    const res = await request(app).post('/goals').set(as('ann')).type('form').send({ name: 'x' });
    expect(res.status).toBe(400);
    expect(res.text).toContain('Add at least one exercise');
    const bad = await request(app).post('/goals').set(as('ann')).type('form').send(goal('not-a-date'));
    expect(bad.status).toBe(400);
  });

  it('escapes user content', async () => {
    await request(app).post('/goals').set(as('ann')).type('form').send(goal('2026-03-20', { name: '<script>alert(1)</script>' }));
    const res = await request(app).get('/goals').set(as('ann'));
    expect(res.text).not.toContain('<script>alert(1)</script>');
    expect(res.text).toContain('&lt;script&gt;');
  });

  it('edits active goals and uses the latest item date as the end date', async () => {
    await request(app).post('/goals').set(as('ann')).type('form').send(goal('2026-03-20'));
    await request(app)
      .post('/goals/1')
      .set(as('ann'))
      .type('form')
      .send(goal('2026-03-20', { 'items[1][exercise]': 'Swim', 'items[1][activity]': '20 laps', 'items[1][dueDate]': '2026-03-25' }))
      .expect(303);
    expect(store.get('ann', 1)).toMatchObject({ endDate: '2026-03-25', items: [{ exercise: 'Running' }, { exercise: 'Swim' }] });
  });

  it('shares a goal by email', async () => {
    await request(app).post('/goals').set(as('ann')).type('form').send(goal('2026-03-20'));
    const res = await request(app).post('/goals/1/share').set(as('ann')).type('form').send({ recipient: 'friend@example.com' });
    expect(res.status).toBe(200);
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({ to: 'friend@example.com', replyTo: 'ann@example.com' });
    expect(sent[0]!.text).toContain('Running: 5 km');
    await request(app).post('/goals/1/share').set(as('ann')).type('form').send({ recipient: 'nope' }).expect(400);
    expect(sent).toHaveLength(1);
  });

  it('sets security headers and a strict CSP', async () => {
    const res = await request(app).get('/');
    expect(res.headers['content-security-policy']).toContain("script-src 'self'");
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('returns a friendly 404', async () => {
    await request(app).get('/nope').expect(404);
  });
});

describe('loadConfig', () => {
  it('requires Auth0 settings normally', () => {
    expect(() => loadConfig({})).toThrow(/Invalid configuration/);
  });
  it('needs nothing in demo mode', () => {
    expect(loadConfig({ DEV_AUTH: 'true' }).DEV_AUTH).toBe(true);
  });
});

describe('isoWeek', () => {
  it.each([
    ['2026-01-01', 1],
    ['2021-01-03', 53],
    ['2026-03-18', 12],
    ['2024-12-30', 1],
  ])('%s is week %i', (d, w) => expect(isoWeek(d)).toBe(w));
});
