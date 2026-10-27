import { Body, Controller, HttpCode, Post } from '@nestjs/common'
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
}
