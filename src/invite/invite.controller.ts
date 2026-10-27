import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { Public } from '../auth/decorators/public.decorator'
import { RequiredRoles } from '../auth/decorators/required-rules.decorator'
import { UserRole } from '../user/enums/user-role.enum'
import { AcceptInviteDto, CreateInviteDto } from './dto'
import { InviteService } from './invite.service'

@Controller('invite')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  // POST /invite: cria o convite e envia o email.
  // O código não é devolvido na resposta, ele só chega por email.
  @RequiredRoles(UserRole.ADMIN)
  @HttpCode(201)
  @Post('create')
  async createInviteUser(@Body() dto: CreateInviteDto) {
    await this.inviteService.createInviteUser(dto)

    return { message: 'Convite enviado com sucesso' }
  }

  // POST /invite/register: o funcionário cria a conta usando o código do convite
  @Public()
  @HttpCode(201)
  @Post('register')
  register(@Body() dto: AcceptInviteDto) {
    return this.inviteService.acceptInviteUser(dto)
  }
}
