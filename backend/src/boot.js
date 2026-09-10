export function assertJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required.');
  }
  if (
    process.env.NODE_ENV === 'production' &&
    /change-this-to-a-long-random-secret/i.test(process.env.JWT_SECRET)
  ) {
    throw new Error('JWT_SECRET must not be the placeholder value in production.');
  }
}
