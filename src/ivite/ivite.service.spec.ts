import { Test, TestingModule } from '@nestjs/testing';
import { IviteService } from './ivite.service';

describe('IviteService', () => {
  let service: IviteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IviteService],
    }).compile();

    service = module.get<IviteService>(IviteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
