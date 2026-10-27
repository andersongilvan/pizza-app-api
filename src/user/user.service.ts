import { ConflictException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { hashSync } from 'bcryptjs'
import { Repository } from 'typeorm'
import { User } from '../entities/user.entity'
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

  private resolveUserResponse(user: User) {
    const { password, ...userWithoutPassword } = user
    void password
    return userWithoutPassword
  }
}
