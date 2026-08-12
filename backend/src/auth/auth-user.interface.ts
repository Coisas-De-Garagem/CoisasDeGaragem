import { UserRole } from '@prisma/client';

/**
 * Shape of the authenticated user object attached to `request.user`
 * by the JWT strategy and exposed via the `@CurrentUser()` decorator.
 */
export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
}
