import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { Public } from './decorators/public.decorator'
import { ForgotPasswordDto, LoginDto, ResetPasswordDto } from './dto'
import { PasswordResetService } from './password-reset.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  // POST /auth/login: público, porque o usuário ainda não tem token
  @Public()
  @HttpCode(200)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  // POST /auth/forgot-password: pede o email de redefinição de senha.
  // A resposta é sempre a mesma, exista ou não uma conta com esse email.
  @Public()
  @HttpCode(200)
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.passwordResetService.forgotPassword(dto)

    return {
      message: 'Se o email estiver cadastrado, você receberá as instruções',
    }
  }

  // POST /auth/reset-password: define a nova senha usando o token recebido por email
  @Public()
  @HttpCode(200)
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.passwordResetService.resetPassword(dto)

    return { message: 'Senha redefinida com sucesso' }
  }
}
