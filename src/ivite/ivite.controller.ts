import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { AcceptInviteDto, CreateInviteDto } from './dto'
import { IviteService } from './ivite.service'

@Controller('invite')
export class IviteController {
  constructor(private readonly iviteService: IviteService) {}

  // POST /invite: cria o convite e envia o email.
  // O código não é devolvido na resposta, ele só chega por email.
  @HttpCode(201)
  @Post('create')
  async createInviteUser(@Body() dto: CreateInviteDto) {
    await this.iviteService.createInviteUser(dto)

    return { message: 'Convite enviado com sucesso' }
  }

  // POST /invite/register: o funcionário cria a conta usando o código do convite
  @HttpCode(201)
  @Post('register')
  register(@Body() dto: AcceptInviteDto) {
    return this.iviteService.acceptInviteUser(dto)
  }
}
