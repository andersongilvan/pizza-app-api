import { IsEmail, IsString, MaxLength } from 'class-validator'

export class CreateInviteDto {
  @IsString({ message: 'O email deve ser uma string' })
  @IsEmail({}, { message: 'O email deve ser válido' })
  @MaxLength(100, { message: 'O email deve ter no máximo 100 caracteres' })
  email: string
}
