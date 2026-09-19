export class PasswordResetTokenRecord {
  constructor(
    public readonly userId: unknown,
    public readonly tokenHash: string,
    public readonly expiresAt: Date,
    public readonly used: boolean,
  ) {}
}
