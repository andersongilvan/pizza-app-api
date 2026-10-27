import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { User } from '../entities/user.entity'
import { UserRole } from '../enums/user-role.enum'
import { IviteService } from '../ivite/ivite.service'
import { UserService } from './user.service'

describe('UserService', () => {
  let service: UserService

  const userRepository = {
    findOne: jest.fn(),
    create: jest.fn((data: Partial<User>) => ({ id: 'user-id', ...data })),
    save: jest.fn(),
  }
  const manager = { getRepository: jest.fn(() => userRepository) }
  const dataSource = {
    transaction: jest.fn((callback: (m: typeof manager) => unknown) =>
      callback(manager),
    ),
  }
  const iviteService = { consume: jest.fn() }

  beforeEach(async () => {
    jest.clearAllMocks()
    userRepository.findOne.mockResolvedValue(null)

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: IviteService, useValue: iviteService },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile()

    service = module.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('registerWithInvite', () => {
    const dto = { name: 'Ana', password: 'secret123' }

    it('creates a STAFF user with the invited email inside the transaction', async () => {
      iviteService.consume.mockResolvedValue({ invitedEmail: 'func@pizza.com' })

      const result = await service.registerWithInvite('code', dto)

      expect(iviteService.consume).toHaveBeenCalledWith('code', manager)
      expect(result).toMatchObject({
        name: 'Ana',
        email: 'func@pizza.com',
        role: UserRole.STAFF,
      })
      expect(result).not.toHaveProperty('password')
    })

    it('does not create a user when the invite is invalid', async () => {
      iviteService.consume.mockRejectedValue(new NotFoundException())

      await expect(
        service.registerWithInvite('code', dto),
      ).rejects.toBeInstanceOf(NotFoundException)
      expect(userRepository.save).not.toHaveBeenCalled()
    })

    it('rejects when the invited email already has an account', async () => {
      iviteService.consume.mockResolvedValue({ invitedEmail: 'func@pizza.com' })
      userRepository.findOne.mockResolvedValue({ id: 'other-user' })

      await expect(
        service.registerWithInvite('code', dto),
      ).rejects.toBeInstanceOf(ConflictException)
      expect(userRepository.save).not.toHaveBeenCalled()
    })
  })
})
