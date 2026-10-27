import {
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { randomBytes } from 'node:crypto'
import { EntityManager, IsNull, Repository } from 'typeorm'
import { Invite } from '../entities/invite.entity'
import { User } from '../entities/user.entity'
import { MailService } from '../mail/mail.service'
import { CreateInviteDto } from './dto'

const INVITE_TTL_HOURS = 48
const DEFAULT_FRONTEND_URL = 'http://localhost:5173'

@Injectable()
export class IviteService {
  constructor(
    @InjectRepository(Invite)
    private readonly inviteRepository: Repository<Invite>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async create({ email }: CreateInviteDto) {
    const userWithEmail = await this.userRepository.findOne({
      where: { email },
    })
    if (userWithEmail) {
      throw new ConflictException('Email já está em uso')
    }

    // Um novo convite invalida os anteriores ainda não utilizados para o mesmo email
    await this.inviteRepository.delete({
      invitedEmail: email,
      usedAt: IsNull(),
    })

    const invite = this.inviteRepository.create({
      code: randomBytes(32).toString('hex'),
      invitedEmail: email,
      expiresAt: new Date(Date.now() + INVITE_TTL_HOURS * 60 * 60 * 1000),
    })
    await this.inviteRepository.save(invite)

    try {
      await this.mailService.sendStaffInvite(
        email,
        this.buildInviteLink(invite.code),
      )
    } catch {
      await this.inviteRepository.delete(invite.id)
      throw new ServiceUnavailableException(
        'Não foi possível enviar o email de convite',
      )
    }

    return {
      id: invite.id,
      invitedEmail: invite.invitedEmail,
      expiresAt: invite.expiresAt,
    }
  }

  async validate(code: string) {
    const invite = await this.inviteRepository.findOne({ where: { code } })
    this.assertUsable(invite)

    return { invitedEmail: invite.invitedEmail, expiresAt: invite.expiresAt }
  }

  /**
   * Consome o convite dentro da transação do chamador. O lock impede que dois
   * cadastros simultâneos usem o mesmo convite.
   */
  async consume(code: string, manager: EntityManager) {
    const invite = await manager.findOne(Invite, {
      where: { code },
      lock: { mode: 'pessimistic_write' },
    })
    this.assertUsable(invite)

    invite.usedAt = new Date()
    await manager.save(invite)

    return invite
  }

  private assertUsable(invite: Invite | null): asserts invite is Invite {
    if (!invite || invite.usedAt || invite.expiresAt <= new Date()) {
      throw new NotFoundException('Convite inválido ou expirado')
    }
  }

  private buildInviteLink(code: string) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? DEFAULT_FRONTEND_URL

    return `${frontendUrl}/register?code=${encodeURIComponent(code)}`
  }
}
