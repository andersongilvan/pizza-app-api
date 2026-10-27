import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'

import { ExtractJwt, Strategy } from 'passport-jwt'
import { UserService } from '../../user/user.service'
import { JwtPayload } from '../auth.types'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      issuer: configService.getOrThrow<string>('JWT_ISSUER'),
    })
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.findById(payload.sub)
    if (!user) {
      throw new UnauthorizedException('Não autorizado')
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  }
}
