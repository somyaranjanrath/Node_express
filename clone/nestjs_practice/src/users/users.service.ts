import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  async findAll(reqUser?: any) {
    const rawUsers = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        todos_performed: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ role: 'asc' }, { username: 'asc' }],
    });

    const users = rawUsers
      .sort((a, b) => {
        const aAdmin = a.role === 'admin' ? 0 : 1;
        const bAdmin = b.role === 'admin' ? 0 : 1;
        if (aAdmin !== bAdmin) return aAdmin - bAdmin;
        return (a.username || '').localeCompare(b.username || '');
      })
      .map((u) => ({
        ...u,
        role: u.role || 'user',
        todos_performed: u.todos_performed ?? 0,
        createdAt: u.createdAt || new Date(parseInt(u.id.substring(0, 8), 16) * 1000),
        updatedAt: u.updatedAt || new Date(parseInt(u.id.substring(0, 8), 16) * 1000),
      }));

    if (reqUser?.username) {
      await this.activityLogsService.log({
        sessionId: reqUser?.sessionId || null,
        userId: reqUser?.id || null,
        username: reqUser.username,
        role: reqUser?.role || 'user',
        action: 'VIEW_USERS',
        details: `Viewed user list (${users.length} users)`,
        endpoint: '/api/user/get_User',
        method: 'GET',
      });
    }

    return {
      message: 'users fetched successfully',
      users,
    };
  }

  async removeUser(
    targetIdentifier: { id?: string; userId?: string; username?: string; email?: string },
    adminUser: any,
  ) {
    const { id, userId, username, email } = targetIdentifier;
    const targetId = id || userId;

    let userToFind = null;
    if (targetId) {
      userToFind = await this.prisma.user.findUnique({ where: { id: targetId } });
    } else if (username && email) {
      userToFind = await this.prisma.user.findFirst({
        where: {
          OR: [
            { username: { equals: username.trim(), mode: 'insensitive' } },
            { email: { equals: email.trim(), mode: 'insensitive' } },
          ],
        },
      });
    } else if (username) {
      userToFind = await this.prisma.user.findFirst({
        where: { username: { equals: username.trim(), mode: 'insensitive' } },
      });
    } else if (email) {
      userToFind = await this.prisma.user.findFirst({
        where: { email: { equals: email.trim(), mode: 'insensitive' } },
      });
    }

    if (!userToFind) {
      throw new NotFoundException('User to remove was not found');
    }

    if (adminUser && userToFind.id === adminUser.id) {
      await this.activityLogsService.log({
        sessionId: adminUser?.sessionId || null,
        userId: adminUser?.id || null,
        username: adminUser?.username || 'admin',
        role: adminUser?.role || 'admin',
        action: 'DELETE_USER',
        details: `Failed delete user: Admin '${adminUser?.username}' attempted to delete their own active account`,
        endpoint: '/api/user/delete_user',
        method: 'DELETE',
        status: 'FAILED',
      });
      throw new BadRequestException('Admin cannot delete their own active account.');
    }

    const deleted = await this.prisma.user.delete({
      where: { id: userToFind.id },
    });

    // Remove permissions in roles_based_access
    await this.prisma.rolesBasedAccess.deleteMany({
      where: { username: deleted.username },
    });

    await this.activityLogsService.log({
      sessionId: adminUser?.sessionId || null,
      userId: adminUser?.id || null,
      username: adminUser?.username || 'admin',
      role: adminUser?.role || 'admin',
      action: 'DELETE_USER',
      details: `Admin '${adminUser?.username}' deleted user '${deleted.username}' (${deleted.email})`,
      endpoint: '/api/user/delete_user',
      method: 'DELETE',
    });

    return {
      message: 'User removed successfully',
      user: {
        id: deleted.id,
        username: deleted.username,
        email: deleted.email,
        role: deleted.role,
      },
    };
  }

  async getSessionLogs(reqUser?: any) {
    const rawActivities = await this.prisma.sessionLog.findMany({
      orderBy: { loginTime: 'desc' },
    });

    const activities = rawActivities.map((log) => ({
      ...log,
      logoutTime:
        typeof log.logoutTime === 'object' && log.logoutTime !== null && '$date' in (log.logoutTime as any)
          ? (log.logoutTime as any)['$date']
          : log.logoutTime ?? 'Session in progress',
    }));

    await this.activityLogsService.log({
      sessionId: reqUser?.sessionId || null,
      userId: reqUser?.id || null,
      username: reqUser?.username || 'anonymous',
      role: reqUser?.role || 'unknown',
      action: 'VIEW_SESSION_LOGS',
      details: `Viewed session logs (${activities.length} sessions)`,
      endpoint: '/api/user/session_logs',
      method: 'GET',
    });

    return {
      message: 'activities fetched successfully',
      activities,
    };
  }

  async getAccess(username?: string, reqUser?: any) {
    const where: any = {};
    if (username && username.trim()) {
      where.username = { equals: username.trim(), mode: 'insensitive' };
    }

    const accessList = await this.prisma.rolesBasedAccess.findMany({
      where,
      orderBy: [{ role: 'asc' }, { username: 'asc' }],
    });

    await this.activityLogsService.log({
      sessionId: reqUser?.sessionId || null,
      userId: reqUser?.id || null,
      username: reqUser?.username || 'anonymous',
      role: reqUser?.role || 'unknown',
      action: 'VIEW_ACCESS_LIST',
      details: `Viewed role-based access list (${accessList.length} records)`,
      endpoint: '/api/user/roles_based_access',
      method: 'GET',
    });

    return {
      message: 'access list fetched successfully',
      access: accessList,
    };
  }
}
