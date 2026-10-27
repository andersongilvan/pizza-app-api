import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'
import { passwordResetTemplate } from './templates/password-reset'
import { staffInviteTemplate } from './templates/staff-invite'

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter
  private readonly from: string

  constructor(private readonly configService: ConfigService) {
    const port = Number(this.configService.getOrThrow('MAILER_PORT'))
    const user = this.configService.getOrThrow<string>('MAILER_USER')

    this.from = this.configService.get<string>('MAILER_FROM') ?? user
    this.transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('MAILER_HOST'),
      port,
      secure: port === 465,
      auth: {
        user,
        pass: this.configService.getOrThrow<string>('MAILER_PASSWORD'),
      },
    })
  }

  async sendMail(options: nodemailer.SendMailOptions) {
    return this.transporter.sendMail({ from: this.from, ...options })
  }

  // Envia o email de convite para criação de conta de funcionário
  async sendStaffInvite(to: string, inviteLink: string, username?: string) {
    return this.sendMail({
      to,
      subject: 'Convite para criar sua conta de funcionário',
      text: `Você foi convidado para criar sua conta de funcionário. Acesse o link para concluir o cadastro: ${inviteLink}`,
      html: staffInviteTemplate(username, inviteLink),
    })
  }

  // Envia o email com o link para redefinir a senha
  async sendPasswordReset(to: string, resetLink: string) {
    return this.sendMail({
      to,
      subject: 'Redefinição de senha',
      text: `Recebemos um pedido para redefinir a sua senha. Acesse o link para escolher uma nova senha (válido por 1 hora): ${resetLink}`,
      html: passwordResetTemplate(resetLink),
    })
  }
}
