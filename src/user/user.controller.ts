import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common'
import { CreateUserDto, RegisterWithInviteDto } from './dto'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(201)
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.save(dto)
  }

  @HttpCode(201)
  @Post('register/:code')
  registerWithInvite(
    @Param('code') code: string,
    @Body() dto: RegisterWithInviteDto,
  ) {
    return this.userService.registerWithInvite(code, dto)
  }
}
