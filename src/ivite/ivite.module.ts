import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Invite } from './entities/invite.entity'
import { MailModule } from '../mail/mail.module'
import { UserModule } from '../user/user.module'
import { IviteController } from './ivite.controller'
import { IviteService } from './ivite.service'

@Module({
  imports: [TypeOrmModule.forFeature([Invite]), UserModule, MailModule],
  controllers: [IviteController],
  providers: [IviteService],
})
export class IviteModule {}
