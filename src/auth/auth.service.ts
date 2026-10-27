import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { compareSync } from 'bcryptjs'
import { Repository } from 'typeorm'
import { User } from '../entities/user.entity'
import { JwtPayload } from './auth.types'
import { LoginDto } from './dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // Valida email e senha e devolve o token de acesso
  async login({ email, password }: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email } })

    // Mesma resposta para email inexistente e senha errada, para não revelar qual deles falhou
    if (!user || !compareSync(password, user.password)) {
      throw new UnauthorizedException('Credenciais inválidas')
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = await this.jwtService.signAsync(payload)

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      accessToken,
    }
  }
}
