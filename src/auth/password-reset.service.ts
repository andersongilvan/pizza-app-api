import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { createHash, randomBytes } from 'node:crypto'
import { IsNull, Repository } from 'typeorm'
import { MailService } from '../mail/mail.service'
import { UserService } from '../user/user.service'
import { ForgotPasswordDto, ResetPasswordDto } from './dto'
import { PasswordResetToken } from './entities/password-reset-token.entity'

// Tempo de validade do link de redefinição
const RESET_TOKEN_TTL_MINUTES = 60
// Endereço do front usado quando FRONTEND_URL não está definido no .env
const DEFAULT_FRONTEND_URL = 'http://localhost:5173'

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name)

  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly tokenRepository: Repository<PasswordResetToken>,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  // Gera o token de redefinição e envia o link por email.
  // Não lança erro se o email não existir ou o envio falhar, para a resposta
  // não revelar quais emails têm conta.
  async forgotPassword({ email }: ForgotPasswordDto) {
    const user = await this.userService.findByEmail(email)
    if (!user) {
      return
    }

    // Um novo pedido invalida os anteriores que ainda não foram usados
    await this.tokenRepository.delete({ userId: user.id, usedAt: IsNull() })

    // O token original só vai no email, no banco fica apenas o hash
    const token = randomBytes(32).toString('hex')
    const resetToken = this.tokenRepository.create({
      userId: user.id,
      tokenHash: this.hash(token),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000),
    })
    await this.tokenRepository.save(resetToken)

    try {
      await this.mailService.sendPasswordReset(
        user.email,
        this.buildResetLink(token),
      )
    } catch (error) {
      // O email não saiu: remove o token e registra o erro no log
      await this.tokenRepository.delete(resetToken.id)
      this.logger.error(
        'Falha ao enviar o email de redefinição de senha',
        error,
      )
    }
  }

  // Troca a senha e marca o token como usado, tudo na mesma transação
  async resetPassword({ token, password }: ResetPasswordDto) {
    await this.tokenRepository.manager.transaction(async (manager) => {
      // O lock impede que o mesmo token seja usado por duas requisições ao mesmo tempo
      const resetToken = await manager.findOne(PasswordResetToken, {
        where: { tokenHash: this.hash(token) },
        lock: { mode: 'pessimistic_write' },
      })

      // Mesma resposta para token inexistente, já usado ou expirado
      if (
        !resetToken ||
        resetToken.usedAt ||
        resetToken.expiresAt <= new Date()
      ) {
        throw new BadRequestException('Token inválido ou expirado')
      }

      await this.userService.updatePassword(resetToken.userId, password)

      resetToken.usedAt = new Date()
      await manager.save(resetToken)
    })
  }

  private hash(token: string) {
    return createHash('sha256').update(token).digest('hex')
  }

  // Link que o usuário abre para escolher a nova senha
  private buildResetLink(token: string) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? DEFAULT_FRONTEND_URL

    return `${frontendUrl}/reset-password?token=${token}`
  }
}
