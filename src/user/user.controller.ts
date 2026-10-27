import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { CreateUserDto } from './dto'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(201)
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.save(dto)
  }
}
