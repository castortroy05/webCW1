import type { RequestHandler } from 'express';

/**
 * Stand-in for Auth0 in local demo mode: everyone is signed in as one demo user.
 * Never wired up unless the `demo` script is used, and refused in production.
 */
export const devAuth: RequestHandler = (req, res, next) => {
  (req as any).oidc = {
    user: { sub: 'demo|user', nickname: 'demo', name: 'Demo User', email: 'demo@example.com' },
  };
  (res as any).oidc = { login: () => res.redirect('/') };
  next();
};
