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
import { ActivityLogsService } from '../../activity-logs/activity-logs.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly activityLogsService: ActivityLogsService,
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
    const endpoint = request.originalUrl || request.url || '';
    const method = (request.method || 'GET').toUpperCase();

    let action = 'ADMIN_OPERATION';
    if (endpoint.includes('delete_user') || endpoint.includes('remove_user')) {
      action = 'DELETE_USER';
    } else if (endpoint.includes('/update')) {
      action = 'UPDATE_TODO';
    } else if (endpoint.includes('/remove')) {
      action = 'DELETE_TODO';
    } else if (endpoint.includes('/create') || endpoint.includes('/send')) {
      action = 'CREATE_TODO';
    }

    if (!user) {
      await this.activityLogsService.log({
        username: 'Guest',
        role: 'user',
        action,
        details: `Unauthorized attempt: Anonymous guest attempted admin action '${action}' without authentication`,
        endpoint,
        method,
        status: 'FAILED',
      });
      throw new UnauthorizedException('Authentication required');
    }

    const hasRole = requiredRoles.some(
      (role) => user.role?.toLowerCase() === role.toLowerCase(),
    );

    if (!hasRole) {
      await this.activityLogsService.log({
        sessionId: request.sessionId || user.sessionId || null,
        userId: user.id || null,
        username: user.username,
        role: user.role || 'user',
        action,
        details: `Access denied: User '${user.username}' (${user.role || 'user'}) attempted admin-only action '${action}' without privileges`,
        endpoint,
        method,
        status: 'FAILED',
      });

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
        await this.activityLogsService.log({
          userId: user.id,
          username: user.username,
          role: user.role,
          action,
          details: `Admin '${user.username}' attempted '${action}' without an active login session`,
          endpoint,
          method,
          status: 'FAILED',
        });

        throw new UnauthorizedException(
          `Admin '${user.username}' is not currently logged in. Please login first.`,
        );
      }

      request.sessionId = activeSession.id;
    }

    return true;
  }
}
