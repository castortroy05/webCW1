import express, { type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import { auth } from 'express-openid-connect';
import helmet from 'helmet';
import nunjucks from 'nunjucks';
import { join } from 'node:path';
import type { Config } from './config.js';
import type { GoalStore } from './db.js';
import { isoDate } from './dates.js';
import type { Mailer } from './mailer.js';
import { createRouter } from './routes.js';

export interface AppDeps {
  config: Pick<Config, 'BASE_URL' | 'TRUST_PROXY'> & Partial<Config>;
  store: GoalStore;
  mailer: Mailer;
  /** Replaces the Auth0 middleware (used by tests). */
  authMiddleware?: RequestHandler;
  now?: () => Date;
}

function auth0(config: Config): RequestHandler {
  return auth({
    authRequired: false,
    auth0Logout: true,
    secret: config.SESSION_SECRET,
    baseURL: config.BASE_URL,
    clientID: config.AUTH0_CLIENT_ID,
    issuerBaseURL: config.AUTH0_ISSUER_BASE_URL,
    ...(config.AUTH0_CLIENT_SECRET
      ? { clientSecret: config.AUTH0_CLIENT_SECRET, authorizationParams: { response_type: 'code', scope: 'openid profile email' } }
      : {}),
  });
}

function originHost(origin: string): string | undefined {
  try {
    return new URL(origin).host;
  } catch {
    return undefined; // e.g. "null" from sandboxed or privacy-stripped requests
  }
}

/** Rejects cross-site form posts: a browser-supplied Origin must match our host. */
const sameOrigin: RequestHandler = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (origin && originHost(origin) !== req.get('host')) {
    res.status(403).render('error.njk', { title: 'Forbidden', status: 403, message: 'Cross-site request blocked.' });
    return;
  }
  next();
};

export function createApp(deps: AppDeps): express.Express {
  const { config, store, mailer } = deps;
  const root = import.meta.dirname;
  const app = express();

  app.disable('x-powered-by');
  if (config.TRUST_PROXY) app.set('trust proxy', 1);

  const env = nunjucks.configure(join(root, 'views'), { autoescape: true, express: app, noCache: process.env.NODE_ENV !== 'production' });
  env.addGlobal('today', () => isoDate((deps.now ?? (() => new Date()))()));
  app.set('view engine', 'njk');

  app.use(
    helmet({
      // "same-origin" (not helmet's "no-referrer") so browsers send a real Origin on form posts.
      referrerPolicy: { policy: 'same-origin' },
      contentSecurityPolicy: {
        directives: { 'img-src': ["'self'", 'data:', 'https:'] },
      },
    }),
  );
  app.use('/vendor/bootstrap', express.static(join(root, '../node_modules/bootstrap/dist')));
  app.use('/vendor/bootstrap-icons', express.static(join(root, '../node_modules/bootstrap-icons/font')));
  app.use(express.static(join(root, 'public')));
  app.get('/healthz', (_req, res) => void res.json({ ok: true }));

  app.use(deps.authMiddleware ?? auth0(config as Config));
  app.use(express.urlencoded({ extended: true, limit: '20kb' }));
  app.use(sameOrigin);
  app.use(createRouter({ store, mailer }));

  app.use((_req, res) => {
    res.status(404).render('error.njk', { title: 'Not found', status: 404, message: 'Page not found.' });
  });
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).render('error.njk', { title: 'Error', status: 500, message: 'Something went wrong.' });
  });
  return app;
}
