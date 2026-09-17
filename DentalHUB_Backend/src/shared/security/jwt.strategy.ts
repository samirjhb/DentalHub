import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstanst } from './jwt.constants';
import { Role } from '../enums/role.enum';

interface JwtPayload {
  id: string;
  email: string;
  role: Role;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstanst.secret,
    });
  }

  async validate(payload: JwtPayload) {
    return { userId: payload.id, email: payload.email, role: payload.role };
  }
}
