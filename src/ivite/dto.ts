import { IsEmail, IsString, Length } from 'class-validator'

export class CreateInviteDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string
}

export class AcceptInviteDto {
  @IsString({ message: 'O código deve ser uma string' })
  code: string

  @IsString({ message: 'O nome deve ser uma string' })
  @Length(2, 50, { message: 'O nome deve ter entre 2 e 50 caracteres' })
  name: string

  @IsString({ message: 'A senha deve ser uma string' })
  @Length(6, 50, { message: 'A senha deve ter entre 6 e 50 caracteres' })
  password: string
}
