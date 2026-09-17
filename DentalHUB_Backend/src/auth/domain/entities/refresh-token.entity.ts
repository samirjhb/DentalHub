export class RefreshTokenRecord {
  constructor(
    public readonly userId: unknown,
    public readonly tokenHash: string,
    public readonly expiresAt: Date,
    public readonly revoked: boolean,
    public readonly replacedByTokenHash?: string,
  ) {}
}
