import { BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { MailService } from '../mail/mail.service'
import { UserService } from '../user/user.service'
import { PasswordResetToken } from './entities/password-reset-token.entity'
import { PasswordResetService } from './password-reset.service'

describe('PasswordResetService', () => {
  let service: PasswordResetService

  // Simula a transação: executa o callback com um manager falso
  const manager = { findOne: jest.fn(), save: jest.fn() }
  const tokenRepository = {
    manager: {
      transaction: jest.fn((callback: (m: typeof manager) => unknown) =>
        callback(manager),
      ),
    },
    create: jest.fn((data: Partial<PasswordResetToken>) => ({
      id: 'token-id',
      ...data,
    })),
    save: jest.fn(),
    delete: jest.fn(),
  }
  const userService = { findByEmail: jest.fn(), updatePassword: jest.fn() }
  const mailService = { sendPasswordReset: jest.fn() }
  const configService = { get: jest.fn() }

  beforeEach(async () => {
    jest.clearAllMocks()
    configService.get.mockReturnValue('https://pizza.test')

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetService,
        {
          provide: getRepositoryToken(PasswordResetToken),
          useValue: tokenRepository,
        },
        { provide: UserService, useValue: userService },
        { provide: MailService, useValue: mailService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile()

    service = module.get<PasswordResetService>(PasswordResetService)
  })

  describe('forgotPassword', () => {
    it('does nothing when the email has no account', async () => {
      userService.findByEmail.mockResolvedValue(null)

      await service.forgotPassword({ email: 'x@pizza.com' })

      expect(tokenRepository.save).not.toHaveBeenCalled()
      expect(mailService.sendPasswordReset).not.toHaveBeenCalled()
    })

    it('stores only the token hash and emails the raw token', async () => {
      userService.findByEmail.mockResolvedValue({
        id: 'user-id',
        email: 'func@pizza.com',
      })

      await service.forgotPassword({ email: 'func@pizza.com' })

      const [saved] = tokenRepository.save.mock.calls[0] as [PasswordResetToken]
      const [to, link] = mailService.sendPasswordReset.mock.calls[0] as [
        string,
        string,
      ]
      const rawToken = link.split('token=')[1]

      expect(to).toBe('func@pizza.com')
      expect(saved.userId).toBe('user-id')
      expect(saved.tokenHash).toHaveLength(64)
      expect(saved.tokenHash).not.toBe(rawToken)
      expect(saved.expiresAt.getTime()).toBeGreaterThan(Date.now())
    })

    it('removes the token and does not throw when the email fails', async () => {
      userService.findByEmail.mockResolvedValue({
        id: 'user-id',
        email: 'func@pizza.com',
      })
      mailService.sendPasswordReset.mockRejectedValue(new Error('smtp down'))

      await expect(
        service.forgotPassword({ email: 'func@pizza.com' }),
      ).resolves.toBeUndefined()
      expect(tokenRepository.delete).toHaveBeenLastCalledWith('token-id')
    })
  })

  describe('resetPassword', () => {
    const dto = { token: 'raw-token', password: 'new-secret' }
    const validToken = () => ({
      userId: 'user-id',
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null as Date | null,
    })

    it('updates the password and marks the token as used', async () => {
      const token = validToken()
      manager.findOne.mockResolvedValue(token)

      await service.resetPassword(dto)

      expect(userService.updatePassword).toHaveBeenCalledWith(
        'user-id',
        'new-secret',
        manager,
      )
      expect(token.usedAt).toBeInstanceOf(Date)
      expect(manager.save).toHaveBeenCalledWith(token)
    })

    it.each([
      ['unknown', null],
      ['used', { ...validToken(), usedAt: new Date() }],
      ['expired', { ...validToken(), expiresAt: new Date(Date.now() - 1) }],
    ])('rejects a %s token', async (_label, token) => {
      manager.findOne.mockResolvedValue(token)

      await expect(service.resetPassword(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      )
      expect(userService.updatePassword).not.toHaveBeenCalled()
    })
  })
})
