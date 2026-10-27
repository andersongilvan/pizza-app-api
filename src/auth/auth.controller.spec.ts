import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

describe('AuthController', () => {
  let controller: AuthController

  const authService = { login: jest.fn() }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile()

    controller = module.get<AuthController>(AuthController)
  })

  it('delegates the login to the service', async () => {
    authService.login.mockResolvedValue({ accessToken: 'token' })

    await expect(
      controller.login({ email: 'func@pizza.com', password: 'secret123' }),
    ).resolves.toEqual({ accessToken: 'token' })
  })
})
