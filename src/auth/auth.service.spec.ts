import { UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { hashSync } from 'bcryptjs'
import { UserRole } from '../user/enums/user-role.enum'
import { UserService } from '../user/user.service'
import { AuthService } from './auth.service'

describe('AuthService', () => {
  let service: AuthService

  const userService = { findByEmail: jest.fn() }
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
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  it('returns an access token for valid credentials', async () => {
    userService.findByEmail.mockResolvedValue(user)

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
    userService.findByEmail.mockResolvedValue(null)

    await expect(
      service.login({ email: 'x@pizza.com', password: 'secret123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('rejects a wrong password', async () => {
    userService.findByEmail.mockResolvedValue(user)

    await expect(
      service.login({ email: 'func@pizza.com', password: 'wrong-pass' }),
    ).rejects.toBeInstanceOf(UnauthorizedException)
    expect(jwtService.signAsync).not.toHaveBeenCalled()
  })
})
