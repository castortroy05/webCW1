import type { RequestHandler } from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { isoWeek, isoWeekKey, isRealDate } from '../src/dates.js';
import { GoalStore } from '../src/db.js';
import { parseLegacyDb } from '../src/legacy-import.js';
import type { Mailer } from '../src/mailer.js';

const NOW = new Date('2026-03-18T12:00:00Z');

/** Test auth: the `x-test-user` header signs in as that Auth0 subject. */
const fakeAuth: RequestHandler = (req, res, next) => {
  const sub = req.get('x-test-user');
  (req as any).oidc = {
    user: sub ? { sub, nickname: sub, name: sub, email: `${sub}@example.com` } : undefined,
  };
  (res as any).oidc = {
    login: ({ returnTo }: { returnTo: string }) => res.redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`),
  };
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
    await request(app)
      .post('/goals')
      .set(as('ann'))
      .set('Origin', 'https://evil.example')
      .type('form')
      .send(goal('2026-03-20'))
      .expect(403);
    expect(store.list('ann')).toHaveLength(0);
  });

  it('rejects opaque origins with 403, not a crash', async () => {
    await request(app)
      .post('/goals')
      .set(as('ann'))
      .set('Origin', 'null')
      .type('form')
      .send(goal('2026-03-20'))
      .expect(403);
  });

  it('accepts same-origin posts that carry an Origin header', async () => {
    await request(app)
      .post('/goals')
      .set(as('ann'))
      .set('Host', 'localhost')
      .set('Origin', 'http://localhost')
      .type('form')
      .send(goal('2026-03-20'))
      .expect(303);
  });

  it('rejects a downgraded scheme in Origin', async () => {
    await request(app)
      .post('/goals')
      .set(as('ann'))
      .set('Host', 'localhost')
      .set('Origin', 'https://localhost')
      .type('form')
      .send(goal('2026-03-20'))
      .expect(403);
  });

  it('rejects impossible calendar dates', async () => {
    const res = await request(app).post('/goals').set(as('ann')).type('form').send(goal('2026-02-31'));
    expect(res.status).toBe(400);
    expect(store.list('ann')).toHaveLength(0);
  });

  it('reports errors against the original row number', async () => {
    const res = await request(app).post('/goals').set(as('ann')).type('form').send({
      'items[0][exercise]': '',
      'items[0][activity]': '',
      'items[0][dueDate]': '',
      'items[1][exercise]': 'Swim',
      'items[1][activity]': '',
      'items[1][dueDate]': '',
    });
    expect(res.text).toContain('Exercise 2:');
    expect(res.text).not.toContain('Exercise 1:');
  });

  it('keeps weeks from different years apart', async () => {
    await request(app)
      .post('/goals')
      .set(as('ann'))
      .type('form')
      .send(goal('2024-12-30', { name: 'Old' }));
    await request(app)
      .post('/goals')
      .set(as('ann'))
      .type('form')
      .send(goal('2026-01-01', { name: 'New' }));
    const res = await request(app).get('/goals?week=2026-W01').set(as('ann'));
    expect(res.text).toContain('New');
    expect(res.text).not.toContain('Old');
  });

  it('validates the goal form', async () => {
    const res = await request(app).post('/goals').set(as('ann')).type('form').send({ name: 'x' });
    expect(res.status).toBe(400);
    expect(res.text).toContain('Add at least one exercise');
    const bad = await request(app).post('/goals').set(as('ann')).type('form').send(goal('not-a-date'));
    expect(bad.status).toBe(400);
  });

  it('escapes user content', async () => {
    await request(app)
      .post('/goals')
      .set(as('ann'))
      .type('form')
      .send(goal('2026-03-20', { name: '<script>alert(1)</script>' }));
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
      .send(
        goal('2026-03-20', {
          'items[1][exercise]': 'Swim',
          'items[1][activity]': '20 laps',
          'items[1][dueDate]': '2026-03-25',
        }),
      )
      .expect(303);
    expect(store.get('ann', 1)).toMatchObject({
      endDate: '2026-03-25',
      items: [{ exercise: 'Running' }, { exercise: 'Swim' }],
    });
  });

  it('shares a goal by email', async () => {
    await request(app).post('/goals').set(as('ann')).type('form').send(goal('2026-03-20'));
    const res = await request(app)
      .post('/goals/1/share')
      .set(as('ann'))
      .type('form')
      .send({ recipient: 'friend@example.com' });
    expect(res.status).toBe(200);
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({ to: 'friend@example.com', replyTo: 'ann@example.com' });
    expect(sent[0]!.text).toContain('Running: 5 km');
    await request(app).post('/goals/1/share').set(as('ann')).type('form').send({ recipient: 'nope' }).expect(400);
    expect(sent).toHaveLength(1);
  });

  it('rate-limits sharing per user', async () => {
    const limited = createApp({
      config: { BASE_URL: 'http://localhost', TRUST_PROXY: false },
      store,
      mailer: { send: async (m) => void sent.push(m) },
      authMiddleware: fakeAuth,
      shareLimit: 2,
    });
    await request(limited).post('/goals').set(as('ann')).type('form').send(goal('2026-03-20'));
    const share = (u: string) =>
      request(limited).post('/goals/1/share').set(as(u)).type('form').send({ recipient: 'f@example.com' });
    await share('ann').expect(200);
    await share('ann').expect(200);
    await share('ann').expect(429);
    expect(sent).toHaveLength(2);
    await share('bob').expect(404); // other users have their own budget (and no access to ann's goal)
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
  it('treats blank optional values as unset', () => {
    const base = {
      BASE_URL: 'http://localhost',
      AUTH0_ISSUER_BASE_URL: 'https://t.auth0.com',
      AUTH0_CLIENT_ID: 'id',
      SESSION_SECRET: 'x'.repeat(32),
    };
    expect(loadConfig({ ...base, AUTH0_CLIENT_SECRET: '', SMTP_URL: '' }).AUTH0_CLIENT_SECRET).toBeUndefined();
  });
  it('needs nothing in demo mode', () => {
    expect(loadConfig({ DEV_AUTH: 'true' }).DEV_AUTH).toBe(true);
  });
});

describe('legacy import', () => {
  const doc = (o: object) =>
    JSON.stringify({
      _id: 'a',
      user: 'old',
      exercise: 'Old goal',
      started: '2021-05-06',
      endDate: '2021-05-12',
      achieved: false,
      goals: [{ exercise: 'Walk', activity: '5 km', endDate: '2021-05-12' }],
      ...o,
    });

  it('maps NeDB documents, with the last line per _id winning and deletions honoured', () => {
    const text = [
      doc({}),
      doc({ achieved: true }),
      doc({ _id: 'b' }),
      JSON.stringify({ $$deleted: true, _id: 'b' }),
    ].join('\n');
    const { goals, skipped } = parseLegacyDb(text, 'old');
    expect(skipped).toBe(0);
    expect(goals).toEqual([
      {
        name: 'Old goal',
        started: '2021-05-06',
        completedAt: '2021-05-12',
        items: [{ exercise: 'Walk', activity: '5 km', dueDate: '2021-05-12' }],
      },
    ]);
  });

  it('skips documents without usable dates and filters by legacy user', () => {
    const text = [doc({ _id: 'x', started: 'bad' }), doc({ _id: 'y', user: 'someone-else' })].join('\n');
    expect(parseLegacyDb(text, 'old')).toEqual({ goals: [], skipped: 1 });
  });

  it('imported goals appear for the target user with derived status', () => {
    const store = new GoalStore(':memory:', () => NOW);
    for (const g of parseLegacyDb(doc({}), 'old').goals) store.importGoal('auth0|1', g);
    expect(store.list('auth0|1')).toMatchObject([{ name: 'Old goal', status: 'overdue', weekKey: '2021-W19' }]);
    expect(store.list('someone-else')).toEqual([]);
  });
});

describe('dates', () => {
  it('builds year-qualified week keys using the ISO year', () => {
    expect(isoWeekKey('2024-12-30')).toBe('2025-W01');
    expect(isoWeekKey('2026-01-01')).toBe('2026-W01');
    expect(isoWeekKey('2021-01-03')).toBe('2020-W53');
  });
  it('detects impossible dates', () => {
    expect(isRealDate('2026-02-28')).toBe(true);
    expect(isRealDate('2026-02-31')).toBe(false);
    expect(isRealDate('2026-13-01')).toBe(false);
    expect(isRealDate('nope')).toBe(false);
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
