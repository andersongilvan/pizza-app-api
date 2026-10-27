import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { DatabaseModule } from './database/database.module'
import { InviteModule } from './invite/invite.module'
import { MailModule } from './mail/mail.module'
import { UserModule } from './user/user.module'

@Module({
  imports: [DatabaseModule, UserModule, MailModule, InviteModule, AuthModule],
})
export class AppModule {}
