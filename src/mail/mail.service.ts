import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'

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

  async sendStaffInvite(to: string, inviteLink: string) {
    return this.sendMail({
      to,
      subject: 'Convite para criar sua conta de funcionário',
      text: `Você foi convidado para criar sua conta de funcionário. Acesse o link para concluir o cadastro: ${inviteLink}`,
      html: `
        <p>Você foi convidado para criar sua conta de funcionário.</p>
        <p><a href="${inviteLink}">Clique aqui para concluir o cadastro</a></p>
      `,
    })
  }
}
