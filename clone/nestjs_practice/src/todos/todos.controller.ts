import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('api')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get('Fetch')
  @UseGuards(OptionalJwtAuthGuard)
  async fetchUpper(@GetUser() user: any) {
    return this.todosService.findAll(user);
  }

  @Get('fetch')
  @UseGuards(OptionalJwtAuthGuard)
  async fetchLower(@GetUser() user: any) {
    return this.todosService.findAll(user);
  }

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() createTodoDto: CreateTodoDto, @GetUser() admin: any) {
    return this.todosService.create(createTodoDto, admin);
  }

  @Post('send')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async send(@Body() createTodoDto: CreateTodoDto, @GetUser() admin: any) {
    return this.todosService.create(createTodoDto, admin);
  }

  @Put('update/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @GetUser() admin: any,
  ) {
    return this.todosService.update(id, updateTodoDto, admin);
  }

  @Delete('remove/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string, @GetUser() admin: any) {
    return this.todosService.remove(id, admin);
  }
}
