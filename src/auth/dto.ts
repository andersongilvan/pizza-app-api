import { IsEmail, IsString, Length } from 'class-validator'

export class LoginDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string

  @IsString({ message: 'A senha deve ser uma string' })
  password: string
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string
}

export class ResetPasswordDto {
  @IsString({ message: 'O token deve ser uma string' })
  token: string

  @IsString({ message: 'A senha deve ser uma string' })
  @Length(6, 50, { message: 'A senha deve ter entre 6 e 50 caracteres' })
  password: string
}
