import {
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { randomUUID } from 'node:crypto'
import { Repository } from 'typeorm'
import { Invite } from './entities/invite.entity'
import { UserRole } from '../user/enums/user-role.enum'
import { MailService } from '../mail/mail.service'
import { UserService } from '../user/user.service'
import { AcceptInviteDto, CreateInviteDto } from './dto'

// Tempo de validade do convite
const INVITE_TTL_HOURS = 48
// Endereço do front usado quando FRONTEND_URL não está definido no .env
const DEFAULT_FRONTEND_URL = 'http://localhost:5173'

@Injectable()
export class InviteService {
  constructor(
    @InjectRepository(Invite)
    private readonly inviteRepository: Repository<Invite>,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  // Cria o convite, envia o link por email e retorna o código gerado
  async createInviteUser(data: CreateInviteDto) {
    // Não convida quem já tem conta
    const emailExists = await this.userService.findByEmail(data.email)
    if (emailExists) {
      throw new ConflictException('Email já está em uso')
    }

    // Salva o convite com o código e a data de expiração
    const invite = this.inviteRepository.create({
      code: randomUUID(),
      invitedEmail: data.email,
      expiresAt: new Date(Date.now() + INVITE_TTL_HOURS * 60 * 60 * 1000),
    })
    await this.inviteRepository.save(invite)

    try {
      await this.mailService.sendStaffInvite(
        data.email,
        this.buildInviteLink(invite.code),
      )
    } catch {
      // Se o email não saiu, remove o convite para não ficar um convite que ninguém recebeu
      await this.inviteRepository.delete(invite.id)
      throw new ServiceUnavailableException(
        'Não foi possível enviar o email de convite',
      )
    }
  }

  // Cria a conta do funcionário a partir do convite e marca o convite como usado
  async acceptInviteUser({ code, name, password }: AcceptInviteDto) {
    // A transação é aberta pelo repositório do convite: ou tudo é salvo, ou nada
    return this.inviteRepository.manager.transaction(async (manager) => {
      // O lock faz uma segunda requisição com o mesmo código esperar esta terminar
      const invite = await manager.findOne(Invite, {
        where: { code },
        lock: { mode: 'pessimistic_write' },
      })

      // Mesma resposta para convite inexistente, já usado ou expirado
      if (!invite || invite.usedAt || invite.expiresAt <= new Date()) {
        throw new NotFoundException('Convite inválido ou expirado')
      }

      // O email vem do convite e o papel é definido aqui, nunca pelo cliente
      const user = await this.userService.save({
        name,
        email: invite.invitedEmail,
        password,
        role: UserRole.STAFF,
      })

      invite.usedAt = new Date()
      await manager.save(invite)

      return user
    })
  }

  // Link que o funcionário abre para criar a conta
  private buildInviteLink(code: string) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? DEFAULT_FRONTEND_URL

    return `${frontendUrl}/register?code=${code}`
  }
}
