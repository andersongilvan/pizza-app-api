import { Module } from '@nestjs/common';
import { IviteService } from './ivite.service';

@Module({
  providers: [IviteService]
})
export class IviteModule {}
