import { pino } from 'pino';

/** JSON logs to stdout. Set LOG_LEVEL to change verbosity; silent under Vitest. */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? (process.env.VITEST ? 'silent' : 'info'),
  redact: ['req.headers.cookie', 'req.headers.authorization', 'res.headers["set-cookie"]'],
});
