import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().int().default(8080),
  BASE_URL: z.url(),
  AUTH0_ISSUER_BASE_URL: z.url(),
  AUTH0_CLIENT_ID: z.string().min(1),
  // Optional: when set, the authorization-code flow is used instead of implicit.
  AUTH0_CLIENT_SECRET: z.string().min(1).optional(),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  DATABASE_PATH: z.string().default('data/goalgetters.db'),
  SMTP_URL: z.string().optional(),
  MAIL_FROM: z.string().default('Goal Getters <no-reply@goalgetters.local>'),
  TRUST_PROXY: z.stringbool().default(false),
  // Local demo only: skips Auth0 and signs everyone in as a demo user.
  DEV_AUTH: z.stringbool().default(false),
});

export type Config = z.infer<typeof schema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  if (env.DEV_AUTH === 'true') {
    // Demo mode needs no Auth0 settings; fill in harmless placeholders.
    env = {
      BASE_URL: `http://localhost:${env.PORT ?? 8080}`,
      AUTH0_ISSUER_BASE_URL: 'https://demo.invalid',
      AUTH0_CLIENT_ID: 'demo',
      SESSION_SECRET: 'demo-mode-only-not-a-secret-0123456789',
      ...env,
    };
  }
  // `.env` files copied from .env.example leave optional keys blank ("KEY="); treat those as unset.
  env = Object.fromEntries(Object.entries(env).filter(([, v]) => v !== ''));
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid configuration:\n${problems}\nSee .env.example`);
  }
  return parsed.data;
}
