import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { PasswordResetService } from './password-reset.service'

describe('AuthController', () => {
  let controller: AuthController

  const authService = { login: jest.fn() }
  const passwordResetService = {
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: PasswordResetService, useValue: passwordResetService },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
  })

  it('delegates the login to the service', async () => {
    authService.login.mockResolvedValue({ accessToken: 'token' })

    await expect(
      controller.login({ email: 'func@pizza.com', password: 'secret123' }),
    ).resolves.toEqual({ accessToken: 'token' })
  })

  it('answers forgot-password with the same message', async () => {
    await expect(
      controller.forgotPassword({ email: 'func@pizza.com' }),
    ).resolves.toEqual({
      message: 'Se o email estiver cadastrado, você receberá as instruções',
    })
    expect(passwordResetService.forgotPassword).toHaveBeenCalled()
  })

  it('delegates reset-password to the service', async () => {
    await expect(
      controller.resetPassword({ token: 't', password: 'new-secret' }),
    ).resolves.toEqual({ message: 'Senha redefinida com sucesso' })
  })
})
