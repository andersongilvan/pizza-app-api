import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../entities/user.entity'
import { IviteModule } from '../ivite/ivite.module'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [TypeOrmModule.forFeature([User]), IviteModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
