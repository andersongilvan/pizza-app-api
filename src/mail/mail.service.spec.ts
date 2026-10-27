import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { MailService } from './mail.service'

describe('MailService', () => {
  let service: MailService

  beforeEach(async () => {
    const env: Record<string, string> = {
      MAILER_HOST: 'localhost',
      MAILER_PORT: '587',
      MAILER_USER: 'user@example.com',
      MAILER_PASSWORD: 'secret',
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => env[key],
            getOrThrow: (key: string) => env[key],
          },
        },
      ],
    }).compile()

    service = module.get<MailService>(MailService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
