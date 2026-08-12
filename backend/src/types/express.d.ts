import type { AuthenticatedUser } from '../auth/auth-user.interface';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
    rawBody?: Buffer;
  }
}
