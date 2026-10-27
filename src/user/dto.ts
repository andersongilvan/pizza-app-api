import { IsEmail, IsOptional, IsString, Length } from 'class-validator'
import { UserRole } from './enums/user-role.enum'

export class CreateUserDto {
  @IsString({ message: 'O nome deve ser uma string' })
  @Length(2, 50, { message: 'O nome deve ter entre 2 e 50 caracteres' })
  name: string

  @IsString({ message: 'O email deve ser uma string' })
  @IsEmail({}, { message: 'O email deve ser válido' })
  email: string

  @IsString({ message: 'A senha deve ser uma string' })
  @Length(6, 50, { message: 'A senha deve ter entre 6 e 50 caracteres' })
  password: string

  @IsOptional()
  role?: UserRole
}
