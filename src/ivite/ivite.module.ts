import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Invite } from '../entities/invite.entity'
import { User } from '../entities/user.entity'
import { MailModule } from '../mail/mail.module'
import { IviteController } from './ivite.controller'
import { IviteService } from './ivite.service'

@Module({
  imports: [TypeOrmModule.forFeature([Invite, User]), MailModule],
  controllers: [IviteController],
  providers: [IviteService],
  exports: [IviteService],
})
export class IviteModule {}
