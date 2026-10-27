import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Invite } from './entities/invite.entity'
import { MailModule } from '../mail/mail.module'
import { UserModule } from '../user/user.module'
import { InviteController } from './invite.controller'
import { InviteService } from './invite.service'

@Module({
  imports: [TypeOrmModule.forFeature([Invite]), UserModule, MailModule],
  controllers: [InviteController],
  providers: [InviteService],
})
export class InviteModule {}
