import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { JWT_SECRET } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
      algorithms: ['HS256'],
    });
  }

  async validate(payload: { id: string; role: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      throw new UnauthorizedException(
        'User belonging to this token no longer exists. Please login again.',
      );
    }

    // Attach active session if present
    const activeSession = await this.prisma.sessionLog.findFirst({
      where: {
        userId: user.id,
        logoutTime: { equals: 'Session in progress' },
      },
      orderBy: { loginTime: 'desc' },
    });

    return {
      ...user,
      sessionId: activeSession ? activeSession.id : null,
    };
  }
}
