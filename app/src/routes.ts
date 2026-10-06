import { Router, type Request, type RequestHandler, type Response } from 'express';
import type { Goal, GoalStore, Status } from './db.js';
import { parseGoalForm, shareForm } from './forms.js';
import type { Mailer } from './mailer.js';

const STATUS_PAGES: Record<string, { status?: Status; title: string }> = {
  all: { title: 'All goals' },
  active: { status: 'active', title: 'Active goals' },
  overdue: { status: 'overdue', title: 'Overdue goals' },
  complete: { status: 'complete', title: 'Completed goals' },
};

interface Profile {
  id: string;
  name: string;
  nickname: string;
  email?: string;
  picture?: string;
  updatedAt?: string;
}

function profile(req: Request): Profile | undefined {
  const u = req.oidc?.user;
  if (!u?.sub) return undefined;
  return {
    id: u.sub,
    name: u.name ?? u.nickname ?? 'Athlete',
    nickname: u.nickname ?? u.name ?? 'Athlete',
    email: u.email,
    picture: u.picture,
    updatedAt: u.updated_at,
  };
}

export function createRouter({ store, mailer }: { store: GoalStore; mailer: Mailer }): Router {
  const router = Router();

  /** Loads the signed-in user (or redirects to login) and exposes them to views. */
  const requireUser: RequestHandler = (req, res, next) => {
    const me = profile(req);
    if (!me) {
      res.oidc.login({ returnTo: req.originalUrl });
      return;
    }
    res.locals.me = me;
    res.locals.counts = store.counts(me.id);
    next();
  };
  const me = (res: Response): Profile => res.locals.me as Profile;

  /** Parses `:id` and loads the caller's goal, or renders a 404. */
  const loadGoal = (req: Request, res: Response): Goal | undefined => {
    const id = Number(req.params.id);
    const goal = Number.isSafeInteger(id) ? store.get(me(res).id, id) : undefined;
    if (!goal) res.status(404).render('error.njk', { title: 'Not found', status: 404, message: 'Goal not found.' });
    return goal;
  };

  router.get('/', (req, res) => {
    const user = profile(req);
    if (!user) return void res.render('home.njk', { title: 'Goal Getters' });
    res.locals.me = user;
    res.locals.counts = store.counts(user.id);
    const upcoming = store.list(user.id, { status: 'active' }).slice(0, 3);
    res.render('home.njk', { title: 'Goal Getters', upcoming });
  });

  router.get('/profile', requireUser, (_req, res) => res.render('profile.njk', { title: 'Profile' }));

  router.get('/goals', requireUser, (req, res) => {
    const key = typeof req.query.status === 'string' ? req.query.status : 'all';
    const page = STATUS_PAGES[key] ?? STATUS_PAGES.all!;
    const week = Number(req.query.week);
    const filter = { ...(page.status ? { status: page.status } : {}), ...(Number.isInteger(week) && week > 0 ? { week } : {}) };
    res.render('goals.njk', {
      title: page.title,
      goals: store.list(me(res).id, filter),
      active: key,
      week: filter.week,
    });
  });

  router.get('/goals/new', requireUser, (_req, res) => {
    res.render('goal-form.njk', { title: 'New goal', action: '/goals', values: { name: '', items: [{}, {}, {}] } });
  });

  router.post('/goals', requireUser, (req, res) => {
    const parsed = parseGoalForm(req.body);
    if (!parsed.ok) {
      return void res.status(400).render('goal-form.njk', { title: 'New goal', action: '/goals', errors: parsed.errors, values: parsed.values });
    }
    store.create(me(res).id, parsed.input);
    res.redirect(303, '/goals');
  });

  router.get('/goals/:id/edit', requireUser, (req, res) => {
    const goal = loadGoal(req, res);
    if (!goal) return;
    if (goal.status !== 'active') return void res.redirect(303, '/goals');
    const items = Array.from({ length: 3 }, (_, i) => goal.items[i] ?? {});
    res.render('goal-form.njk', { title: 'Edit goal', action: `/goals/${goal.id}`, values: { name: goal.name, items } });
  });

  router.post('/goals/:id', requireUser, (req, res) => {
    const goal = loadGoal(req, res);
    if (!goal) return;
    const parsed = parseGoalForm(req.body);
    if (!parsed.ok) {
      return void res.status(400).render('goal-form.njk', { title: 'Edit goal', action: `/goals/${goal.id}`, errors: parsed.errors, values: parsed.values });
    }
    store.update(me(res).id, goal.id, parsed.input);
    res.redirect(303, '/goals');
  });

  router.post('/goals/:id/complete', requireUser, (req, res) => {
    const goal = loadGoal(req, res);
    if (!goal) return;
    store.complete(me(res).id, goal.id);
    res.redirect(303, '/goals');
  });

  router.post('/goals/:id/delete', requireUser, (req, res) => {
    const goal = loadGoal(req, res);
    if (!goal) return;
    store.delete(me(res).id, goal.id);
    res.redirect(303, '/goals');
  });

  router.get('/goals/:id/share', requireUser, (req, res) => {
    const goal = loadGoal(req, res);
    if (goal) res.render('share.njk', { title: 'Share goal', goal });
  });

  router.post('/goals/:id/share', requireUser, async (req, res) => {
    const goal = loadGoal(req, res);
    if (!goal) return;
    const parsed = shareForm.safeParse(req.body);
    if (!parsed.success) {
      return void res.status(400).render('share.njk', {
        title: 'Share goal',
        goal,
        errors: parsed.error.issues.map((i) => i.message),
        values: req.body,
      });
    }
    const user = me(res);
    const lines = goal.items.map((i) => `- ${i.exercise}: ${i.activity} (by ${i.dueDate})`);
    await mailer.send({
      to: parsed.data.recipient,
      replyTo: user.email,
      subject: `${user.name} shared a goal with you: ${goal.name}`,
      text: [`${user.name} wants to share their goal "${goal.name}":`, '', ...lines, '', parsed.data.message ?? ''].join('\n').trim(),
    });
    res.render('share.njk', { title: 'Share goal', goal, sent: parsed.data.recipient });
  });

  return router;
}
