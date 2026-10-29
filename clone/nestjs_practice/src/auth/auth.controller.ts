import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';

@Controller('api/user')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
    return this.authService.login(loginDto, req.originalUrl || '/api/user/login');
  }

  @Post('logout')
  @UseGuards(OptionalJwtAuthGuard)
  async logout(@Body() body: any, @Req() req: any) {
    const user = req.user;
    const identifier =
      user?.id ||
      user?.username ||
      body?.userId ||
      body?.id ||
      body?.username ||
      body?.email;

    return this.authService.logout(identifier, req.originalUrl || '/api/user/logout');
  }
}
