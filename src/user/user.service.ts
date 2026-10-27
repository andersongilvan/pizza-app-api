import { ConflictException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { hashSync } from 'bcryptjs'
import { EntityManager, Repository } from 'typeorm'
import { User } from '../entities/user.entity'
import { CreateUserDto } from './dto'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Com `manager`, salva dentro da transação de quem chamou
  async save(data: CreateUserDto, manager?: EntityManager) {
    const userRepository = manager
      ? manager.getRepository(User)
      : this.userRepository
    const { name, email, password, role } = data
    const userWithEmail = await userRepository.findOne({
      where: { email },
    })
    if (userWithEmail) {
      throw new ConflictException('Email já está em uso')
    }

    const passwordHash = hashSync(password, 10)

    const user = userRepository.create({
      name,
      email,
      password: passwordHash,
      role,
    })
    await userRepository.save(user)

    return this.resolveUserResponse(user)
  }

  private resolveUserResponse(user: User) {
    const { password, ...userWithoutPassword } = user
    void password
    return userWithoutPassword
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } })
  }
}
