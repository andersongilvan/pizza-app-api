import { ConflictException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { hashSync } from 'bcryptjs'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { User } from '../entities/user.entity'
import { UserRole } from '../enums/user-role.enum'
import { IviteService } from '../ivite/ivite.service'
import { CreateUserDto, RegisterWithInviteDto } from './dto'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly iviteService: IviteService,
    private readonly dataSource: DataSource,
  ) {}

  async registerWithInvite(
    code: string,
    { name, password }: RegisterWithInviteDto,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const invite = await this.iviteService.consume(code, manager)

      return this.save(
        { name, email: invite.invitedEmail, password, role: UserRole.STAFF },
        manager,
      )
    })
  }

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
}
