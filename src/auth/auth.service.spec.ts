import { UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { hashSync } from 'bcryptjs'
import { User } from '../entities/user.entity'
import { UserRole } from '../enums/user-role.enum'
import { AuthService } from './auth.service'

describe('AuthService', () => {
  let service: AuthService

  const userRepository = { findOne: jest.fn() }
  const jwtService = { signAsync: jest.fn() }

  const user = {
    id: 'user-id',
    email: 'func@pizza.com',
    password: hashSync('secret123', 4),
    role: UserRole.STAFF,
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    jwtService.signAsync.mockResolvedValue('signed-token')

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  it('returns an access token for valid credentials', async () => {
    userRepository.findOne.mockResolvedValue(user)

    const result = await service.login({
      email: 'func@pizza.com',
      password: 'secret123',
    })

    expect(result).toEqual({
      user: { id: 'user-id', email: 'func@pizza.com', role: UserRole.STAFF },
      accessToken: 'signed-token',
    })
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'user-id',
      email: 'func@pizza.com',
      role: UserRole.STAFF,
    })
  })

  it('rejects an unknown email', async () => {
    userRepository.findOne.mockResolvedValue(null)

    await expect(
      service.login({ email: 'x@pizza.com', password: 'secret123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('rejects a wrong password', async () => {
    userRepository.findOne.mockResolvedValue(user)

    await expect(
      service.login({ email: 'func@pizza.com', password: 'wrong-pass' }),
    ).rejects.toBeInstanceOf(UnauthorizedException)
    expect(jwtService.signAsync).not.toHaveBeenCalled()
  })
})
