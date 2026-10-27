import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common'
import { CreateInviteDto } from './dto'
import { IviteService } from './ivite.service'

@Controller('invite')
export class IviteController {
  constructor(private readonly iviteService: IviteService) {}

  @HttpCode(201)
  @Post()
  create(@Body() dto: CreateInviteDto) {
    return this.iviteService.create(dto)
  }

  @Get(':code')
  validate(@Param('code') code: string) {
    return this.iviteService.validate(code)
  }
}
