import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  async findAll(reqUser?: any) {
    const todos = await this.prisma.todo.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (reqUser?.username) {
      await this.activityLogsService.log({
        sessionId: reqUser?.sessionId || null,
        userId: reqUser?.id || null,
        username: reqUser.username,
        role: reqUser?.role || 'user',
        action: 'FETCH_TODOS',
        details: `Fetched ${todos.length} todo(s)`,
        endpoint: '/api/Fetch',
        method: 'GET',
      });
    }

    return {
      message: 'todos....',
      todos,
    };
  }

  async create(createTodoDto: CreateTodoDto, adminUser: any) {
    const { title, description } = createTodoDto;

    const todo = await this.prisma.todo.create({
      data: {
        title,
        description,
        createdBy: adminUser?.username || 'admin',
        userId: adminUser?.id || null,
      },
    });

    if (adminUser?.id) {
      await this.prisma.user.update({
        where: { id: adminUser.id },
        data: { todos_performed: { increment: 1 } },
      }).catch(() => {});
    } else if (adminUser?.username) {
      await this.prisma.user.update({
        where: { username: adminUser.username },
        data: { todos_performed: { increment: 1 } },
      }).catch(() => {});
    }

    await this.activityLogsService.log({
      sessionId: adminUser?.sessionId || null,
      userId: adminUser?.id || null,
      username: adminUser?.username || 'admin',
      role: adminUser?.role || 'admin',
      action: 'CREATE_TODO',
      details: `Created todo '${todo.title}'`,
      endpoint: '/api/create',
      method: 'POST',
    });

    return {
      message: 'Todo stored',
      todo,
    };
  }

  async update(id: string, updateTodoDto: UpdateTodoDto, adminUser: any) {
    const existing = await this.prisma.todo.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    const todo = await this.prisma.todo.update({
      where: { id },
      data: updateTodoDto,
    });

    await this.activityLogsService.log({
      sessionId: adminUser?.sessionId || null,
      userId: adminUser?.id || null,
      username: adminUser?.username || 'admin',
      role: adminUser?.role || 'admin',
      action: 'UPDATE_TODO',
      details: `Updated todo '${todo.title}' (ID: ${id})`,
      endpoint: `/api/update/${id}`,
      method: 'PUT',
    });

    return {
      message: 'Todo Updated',
      todo,
    };
  }

  async remove(id: string, adminUser: any) {
    const existing = await this.prisma.todo.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    const todo = await this.prisma.todo.delete({ where: { id } });

    if (existing?.userId) {
      await this.prisma.user.update({
        where: { id: existing.userId },
        data: { todos_performed: { decrement: 1 } },
      }).catch(() => {});
    } else if (existing?.createdBy) {
      await this.prisma.user.update({
        where: { username: existing.createdBy },
        data: { todos_performed: { decrement: 1 } },
      }).catch(() => {});
    }

    await this.activityLogsService.log({
      sessionId: adminUser?.sessionId || null,
      userId: adminUser?.id || null,
      username: adminUser?.username || 'admin',
      role: adminUser?.role || 'admin',
      action: 'DELETE_TODO',
      details: `Deleted todo '${todo.title}' (ID: ${id})`,
      endpoint: `/api/remove/${id}`,
      method: 'DELETE',
    });

    return {
      message: 'Deleting the todo data......',
      todo,
    };
  }
}
