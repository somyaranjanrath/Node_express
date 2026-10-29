import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { getRoleActivities } from './constants';

const formatDuration = (start: Date, end: Date): string => {
  if (!start || !end) return '0 seconds';
  const diffMs = Math.max(0, new Date(end).getTime() - new Date(start).getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
  return parts.join(' ');
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { username, email, password, role } = signupDto;
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { username: cleanUsername },
        ],
      },
    });

    if (existingUser) {
      const conflictField = existingUser.email === cleanEmail ? 'Email' : 'Username';
      throw new BadRequestException(`${conflictField} is already registered`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role ? role.toLowerCase() : 'user';

    const user = await this.prisma.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        role: userRole,
      },
    });

    // Automatically store permissions in roles_based_access collection
    await this.prisma.rolesBasedAccess.upsert({
      where: { username: user.username },
      update: {
        userId: user.id,
        role: user.role,
        can_perform: getRoleActivities(user.role),
      },
      create: {
        userId: user.id,
        username: user.username,
        role: user.role,
        can_perform: getRoleActivities(user.role),
      },
    });

    return {
      message: 'signup successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto, endpoint = '/api/user/login') {
    const { username, email, password } = loginDto;
    const identifier = (username || email || '').trim();

    if (!identifier || !password) {
      throw new BadRequestException('Username/email and password are required');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('invalid credentials');
    }

    // Check if user is already logged in (active session in progress)
    const activeSession = await this.prisma.sessionLog.findFirst({
      where: {
        userId: user.id,
        logoutTime: { equals: 'Session in progress' },
      },
    });

    if (activeSession) {
      throw new BadRequestException({
        error: `User '${user.username}' is already logged in. Please logout before logging in again.`,
        activeSession: {
          username: activeSession.username,
          role: activeSession.role,
          loginTime: activeSession.loginTime,
          logoutTime: activeSession.logoutTime,
          sessionDuration: activeSession.sessionDuration,
        },
      });
    }

    const loginTime = new Date();

    const activity = await this.prisma.sessionLog.create({
      data: {
        userId: user.id,
        username: user.username,
        role: user.role,
        loginTime,
        logoutTime: 'Session in progress',
        sessionDuration: 'Session in progress',
      },
    });

    await this.activityLogsService.log({
      sessionId: activity.id,
      userId: user.id,
      username: user.username,
      role: user.role,
      action: 'LOGIN',
      details: `User '${user.username}' logged in successfully`,
      endpoint,
      method: 'POST',
    });

    const token = this.jwtService.sign({
      id: user.id,
      role: user.role,
    });

    return {
      message: 'login successfully',
      token,
      activity,
    };
  }

  async logout(userIdOrIdentifier: string, endpoint = '/api/user/logout') {
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: userIdOrIdentifier },
          { username: userIdOrIdentifier },
          { email: userIdOrIdentifier },
        ],
      },
    });

    if (!user) {
      throw new NotFoundException('User not found or credentials missing');
    }

    const activeSession = await this.prisma.sessionLog.findFirst({
      where: {
        userId: user.id,
        logoutTime: { equals: 'Session in progress' },
      },
      orderBy: { loginTime: 'desc' },
    });

    if (!activeSession) {
      throw new BadRequestException(
        `User '${user.username}' is not currently logged in or has already logged out.`,
      );
    }

    const logoutTime = new Date();
    const duration = formatDuration(activeSession.loginTime, logoutTime);

    const updatedSession = await this.prisma.sessionLog.update({
      where: { id: activeSession.id },
      data: {
        logoutTime: logoutTime.toISOString(),
        sessionDuration: duration,
      },
    });

    await this.activityLogsService.log({
      sessionId: activeSession.id,
      userId: user.id,
      username: user.username,
      role: user.role,
      action: 'LOGOUT',
      details: `User '${user.username}' logged out (Session duration: ${duration})`,
      endpoint,
      method: 'POST',
    });

    return {
      message: 'logout successfully',
      activity: {
        username: updatedSession.username,
        role: updatedSession.role,
        loginTime: updatedSession.loginTime,
        logoutTime: updatedSession.logoutTime,
        sessionDuration: updatedSession.sessionDuration,
      },
    };
  }
}
