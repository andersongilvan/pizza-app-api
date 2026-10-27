import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { Observable } from 'rxjs'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super()
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    return super.canActivate(context)
  }

  // Chamado depois que a estratégia JWT roda. Quando o token é recusado, o motivo
  // chega em `info` (e não em `err`), então é aqui que ele é traduzido
  handleRequest<TUser = any>(err: unknown, user: TUser, info?: Error): TUser {
    if (info?.name === 'TokenExpiredError') {
      throw new UnauthorizedException('Token expirado')
    }
    if (info?.name === 'JsonWebTokenError') {
      throw new UnauthorizedException('Token inválido')
    }
    if (info?.message === 'No auth token') {
      throw new UnauthorizedException('Token não informado')
    }
    // Falha interna da estratégia (ex.: usuário não encontrado no validate)
    if (err instanceof Error) {
      throw err
    }
    if (!user) {
      throw new UnauthorizedException('Não autorizado')
    }

    return user
  }
}
