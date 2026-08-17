import { User } from '@prisma/client';

/** User representation without the sensitive password field. */
export type SafeUser = Omit<User, 'password'>;

/** Strips the `password` field from a user record. */
export function stripPassword(user: User): SafeUser {
  const { password: _password, ...rest } = user;
  return rest;
}
