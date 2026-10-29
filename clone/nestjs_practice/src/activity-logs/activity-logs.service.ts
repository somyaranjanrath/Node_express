import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: {
    sessionId?: string | null;
    userId?: string | null;
    username: string;
    role: string;
    action: string;
    details?: string;
    endpoint?: string;
    method?: string;
    status?: string;
  }) {
    try {
      return await this.prisma.activityLog.create({
        data: {
          sessionId: data.sessionId || null,
          userId: data.userId || null,
          username: data.username || 'Guest',
          role: data.role || 'user',
          action: data.action,
          details: data.details || '',
          endpoint: data.endpoint || '',
          method: data.method || '',
          status: data.status || 'SUCCESS',
        },
      });
    } catch (err) {
      console.error('Failed to write activity log:', err.message);
      return null;
    }
  }

  async findAll(query: { sessionId?: string; username?: string; action?: string }) {
    const where: any = {};
    if (query.sessionId) {
      where.sessionId = query.sessionId;
    }
    if (query.username) {
      where.username = { equals: query.username, mode: 'insensitive' };
    }
    if (query.action) {
      where.action = { equals: query.action, mode: 'insensitive' };
    }

    const logs = await this.prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'activity logs fetched successfully',
      count: logs.length,
      logs,
    };
  }
}
