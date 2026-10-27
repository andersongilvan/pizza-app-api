import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { hashSync } from 'bcryptjs'
import { Repository } from 'typeorm'
import { User } from '../entities/user.entity'
import { UserRole } from '../enums/user-role.enum'
import { CreateUserDto } from './dto'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async save(data: CreateUserDto) {
    const { name, email, password, role } = data
    const userWithEmail = await this.userRepository.findOne({
      where: { email },
    })
    if (userWithEmail) {
      throw new ConflictException('Email já está em uso')
    }

    const passwordHash = hashSync(password, 10)

    const user = this.userRepository.create({
      name,
      email,
      password: passwordHash,
      role,
    })
    await this.userRepository.save(user)

    return this.resolveUserResponse(user)
  }

  async userDetails(id: string) {
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException('Usuário não encontrado')
    }
    return this.resolveUserResponse(user)
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } })
  }

  async promoteAdm(id: string) {
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException('Usuário não encontrado')
    }

    if (user.role === UserRole.ADMIN) {
      throw new ConflictException('Usuário já é administrador')
    }

    user.role = UserRole.ADMIN
    await this.userRepository.save(user)
  }

  private resolveUserResponse(user: User) {
    const { password, ...userWithoutPassword } = user
    void password
    return userWithoutPassword
  }
}
