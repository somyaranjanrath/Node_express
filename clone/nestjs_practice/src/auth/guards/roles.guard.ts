import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    const hasRole = requiredRoles.some(
      (role) => user.role?.toLowerCase() === role.toLowerCase(),
    );

    if (!hasRole) {
      throw new ForbiddenException('Access denied. Admin only...');
    }

    // Verify active login session for admin
    if (user.role?.toLowerCase() === 'admin') {
      const activeSession = await this.prisma.sessionLog.findFirst({
        where: {
          userId: user.id,
          logoutTime: { equals: 'Session in progress' },
        },
      });

      if (!activeSession) {
        throw new UnauthorizedException(
          `Admin '${user.username}' is not currently logged in. Please login first.`,
        );
      }

      request.sessionId = activeSession.id;
    }

    return true;
  }
}
