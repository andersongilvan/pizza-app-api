import {
  ConflictException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Invite } from '../entities/invite.entity'
import { User } from '../entities/user.entity'
import { MailService } from '../mail/mail.service'
import { IviteService } from './ivite.service'

describe('IviteService', () => {
  let service: IviteService

  const inviteRepository = {
    delete: jest.fn(),
    create: jest.fn((data: Partial<Invite>) => ({ id: 'invite-id', ...data })),
    save: jest.fn(),
    findOne: jest.fn(),
  }
  const manager = {
    findOne: jest.fn(),
    create: jest.fn((_entity: unknown, data: Partial<User>) => ({
      id: 'user-id',
      ...data,
    })),
    save: jest.fn((entity: unknown) => Promise.resolve(entity)),
  }
  const userRepository = { findOne: jest.fn() }
  const mailService = { sendStaffInvite: jest.fn() }
  const configService = { get: jest.fn() }

  beforeEach(async () => {
    jest.clearAllMocks()
    userRepository.findOne.mockResolvedValue(null)
    configService.get.mockReturnValue('https://pizza.test')

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IviteService,
        { provide: getRepositoryToken(Invite), useValue: inviteRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: MailService, useValue: mailService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile()

    service = module.get<IviteService>(IviteService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('creates the invite and sends the email with the invite link', async () => {
    const result = await service.create({ email: 'func@pizza.com' })

    const [invite] = inviteRepository.save.mock.calls[0] as [Invite]
    expect(invite.code).toHaveLength(64)
    expect(invite.invitedEmail).toBe('func@pizza.com')
    expect(invite.expiresAt.getTime()).toBeGreaterThan(Date.now())
    expect(mailService.sendStaffInvite).toHaveBeenCalledWith(
      'func@pizza.com',
      `https://pizza.test/register?code=${invite.code}`,
    )
    expect(result).not.toHaveProperty('code')
  })

  it('rejects an email that already belongs to a user', async () => {
    userRepository.findOne.mockResolvedValue({ id: 'user-id' })

    await expect(
      service.create({ email: 'func@pizza.com' }),
    ).rejects.toBeInstanceOf(ConflictException)
    expect(inviteRepository.save).not.toHaveBeenCalled()
  })

  it('removes the invite when the email fails to send', async () => {
    mailService.sendStaffInvite.mockRejectedValue(new Error('smtp down'))

    await expect(
      service.create({ email: 'func@pizza.com' }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException)
    expect(inviteRepository.delete).toHaveBeenLastCalledWith('invite-id')
  })
  describe('validate', () => {
    const pending = (overrides: Partial<Invite> = {}) => ({
      invitedEmail: 'func@pizza.com',
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
      ...overrides,
    })

    it('returns the invited email for a pending invite', async () => {
      inviteRepository.findOne.mockResolvedValue(pending())

      await expect(service.validate('code')).resolves.toMatchObject({
        invitedEmail: 'func@pizza.com',
      })
    })

    it.each([
      ['unknown', null],
      ['used', pending({ usedAt: new Date() })],
      ['expired', pending({ expiresAt: new Date(Date.now() - 1) })],
    ])('rejects a %s invite', async (_label, invite) => {
      inviteRepository.findOne.mockResolvedValue(invite)

      await expect(service.validate('code')).rejects.toBeInstanceOf(
        NotFoundException,
      )
    })
  })

  describe('consume', () => {
    const pendingInvite = () => ({
      invitedEmail: 'func@pizza.com',
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null as Date | null,
    })

    it('marks a pending invite as used and returns it', async () => {
      const invite = pendingInvite()
      manager.findOne.mockResolvedValue(invite)

      const result = await service.consume('code', manager as never)

      expect(result).toBe(invite)
      expect(invite.usedAt).toBeInstanceOf(Date)
      expect(manager.save).toHaveBeenCalledWith(invite)
    })

    it.each([
      ['unknown', null],
      ['used', { ...pendingInvite(), usedAt: new Date() }],
      ['expired', { ...pendingInvite(), expiresAt: new Date(Date.now() - 1) }],
    ])('rejects a %s invite', async (_label, invite) => {
      manager.findOne.mockResolvedValue(invite)

      await expect(
        service.consume('code', manager as never),
      ).rejects.toBeInstanceOf(NotFoundException)
      expect(manager.save).not.toHaveBeenCalled()
    })
  })
})
