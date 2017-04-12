import { createError } from 'apollo-errors';

// Mask any internal errors
export const UnknownError = createError('UnknownError', {
  message: 'An unknown error has occurred'
});

// User should be logged in but isn't
export const UnauthorizedError = createError('UnauthorizedError', {
  message: 'You must login to do that'
});

// User is already logged in
export const AlreadyAuthenticatedError = createError('AlreadyAuthenticatedError', {
  message: 'You are already authenticated'
});

// User is trying to perform an admin function
export const ForbiddenError = createError('ForbiddenError', {
  message: 'You are not allowed to do that'
});
