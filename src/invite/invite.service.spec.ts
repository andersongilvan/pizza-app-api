import {
  ConflictException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Invite } from './entities/invite.entity'
import { UserRole } from '../user/enums/user-role.enum'
import { MailService } from '../mail/mail.service'
import { UserService } from '../user/user.service'
import { InviteService } from './invite.service'

describe('InviteService', () => {
  let service: InviteService

  // Simula a transação: executa o callback com um manager falso
  const manager = { findOne: jest.fn(), save: jest.fn() }
  const inviteRepository = {
    manager: {
      transaction: jest.fn((callback: (m: typeof manager) => unknown) =>
        callback(manager),
      ),
    },
    create: jest.fn((data: Partial<Invite>) => ({ id: 'invite-id', ...data })),
    save: jest.fn(),
    delete: jest.fn(),
  }
  const userService = { findByEmail: jest.fn(), save: jest.fn() }
  const mailService = { sendStaffInvite: jest.fn() }
  const configService = { get: jest.fn() }

  beforeEach(async () => {
    jest.clearAllMocks()
    userService.findByEmail.mockResolvedValue(null)
    configService.get.mockReturnValue('https://pizza.test')

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InviteService,
        { provide: getRepositoryToken(Invite), useValue: inviteRepository },
        { provide: UserService, useValue: userService },
        { provide: MailService, useValue: mailService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile()

    service = module.get<InviteService>(InviteService)
  })

  it('saves the invite and sends the email with the invite link', async () => {
    await service.createInviteUser({ email: 'func@pizza.com' })

    const [invite] = inviteRepository.save.mock.calls[0] as [Invite]

    expect(inviteRepository.save).toHaveBeenCalled()
    expect(mailService.sendStaffInvite).toHaveBeenCalledWith(
      'func@pizza.com',
      `https://pizza.test/register?code=${invite.code}`,
    )
  })

  it('rejects an email that already has an account', async () => {
    userService.findByEmail.mockResolvedValue({ id: 'user-id' })

    await expect(
      service.createInviteUser({ email: 'func@pizza.com' }),
    ).rejects.toBeInstanceOf(ConflictException)
    expect(inviteRepository.save).not.toHaveBeenCalled()
  })

  it('removes the invite when the email fails to send', async () => {
    mailService.sendStaffInvite.mockRejectedValue(new Error('smtp down'))

    await expect(
      service.createInviteUser({ email: 'func@pizza.com' }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException)
    expect(inviteRepository.delete).toHaveBeenCalledWith('invite-id')
  })

  describe('acceptInviteUser', () => {
    const dto = { code: 'code', name: 'Ana', password: 'secret123' }
    const pendingInvite = () => ({
      invitedEmail: 'func@pizza.com',
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null as Date | null,
    })

    it('creates a STAFF user and marks the invite as used', async () => {
      const invite = pendingInvite()
      manager.findOne.mockResolvedValue(invite)
      userService.save.mockResolvedValue({ id: 'user-id' })

      const result = await service.acceptInviteUser(dto)

      expect(result).toEqual({ id: 'user-id' })
      expect(userService.save).toHaveBeenCalledWith({
        name: 'Ana',
        email: 'func@pizza.com',
        password: 'secret123',
        role: UserRole.STAFF,
      })
      expect(invite.usedAt).toBeInstanceOf(Date)
      expect(manager.save).toHaveBeenCalledWith(invite)
    })

    it.each([
      ['unknown', null],
      ['used', { ...pendingInvite(), usedAt: new Date() }],
      ['expired', { ...pendingInvite(), expiresAt: new Date(Date.now() - 1) }],
    ])('rejects a %s invite', async (_label, invite) => {
      manager.findOne.mockResolvedValue(invite)

      await expect(service.acceptInviteUser(dto)).rejects.toBeInstanceOf(
        NotFoundException,
      )
      expect(userService.save).not.toHaveBeenCalled()
    })

    it('keeps the invite unused when the user cannot be created', async () => {
      const invite = pendingInvite()
      manager.findOne.mockResolvedValue(invite)
      userService.save.mockRejectedValue(new ConflictException())

      await expect(service.acceptInviteUser(dto)).rejects.toBeInstanceOf(
        ConflictException,
      )
      expect(invite.usedAt).toBeNull()
      expect(manager.save).not.toHaveBeenCalled()
    })
  })
})
