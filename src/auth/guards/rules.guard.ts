import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Request } from 'express'
import { UserRole } from '../../user/enums/user-role.enum'
import { ROLES_KEY } from '../decorators/required-rules.decorator'

@Injectable()
export class RulesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (!requiredRoles) {
      return true
    }

    const { user } = context.switchToHttp().getRequest<Request>()

    if (!requiredRoles.includes(user?.role as UserRole)) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este recurso',
      )
    }

    return true
  }
}
