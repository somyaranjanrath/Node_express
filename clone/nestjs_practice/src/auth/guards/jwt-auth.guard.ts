import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityLogsService } from '../../activity-logs/activity-logs.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogsService: ActivityLogsService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const parentResult = await super.canActivate(context);
      if (parentResult) return true;
    } catch (err) {
      const request = context.switchToHttp().getRequest();
      const activeSession = await this.prisma.sessionLog.findFirst({
        where: { logoutTime: { equals: 'Session in progress' } },
        orderBy: { loginTime: 'desc' },
      });

      if (activeSession && activeSession.userId) {
        const user = await this.prisma.user.findUnique({
          where: { id: activeSession.userId },
        });
        if (user) {
          request.user = {
            ...user,
            sessionId: activeSession.id,
          };
          request.sessionId = activeSession.id;
          return true;
        }
      }

      const endpoint = request.originalUrl || request.url || '';
      if (
        endpoint.includes('/create') ||
        endpoint.includes('/send') ||
        endpoint.includes('/update') ||
        endpoint.includes('/remove') ||
        endpoint.includes('delete_user') ||
        endpoint.includes('remove_user')
      ) {
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

        await this.activityLogsService.log({
          username: 'Guest',
          role: 'user',
          action,
          details: `Unauthorized attempt: Anonymous guest attempted admin action '${action}' without authentication`,
          endpoint,
          method: (request.method || 'GET').toUpperCase(),
          status: 'FAILED',
        });
      }

      throw err;
    }
    return false;
  }
}

