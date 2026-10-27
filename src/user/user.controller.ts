import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common'
import type { Request } from 'express'
import { RequiredRoles } from '../auth/decorators/required-rules.decorator'
import { UserRole } from '../enums/user-role.enum'
import { CreateUserDto } from './dto'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @RequiredRoles(UserRole.ADMIN)
  @HttpCode(201)
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.save(dto)
  }

  @RequiredRoles(UserRole.STAFF, UserRole.ADMIN)
  @HttpCode(200)
  @Get('me')
  userDetails(@Req() req: Request) {
    return this.userService.userDetails(req.user!.id)
  }
}
