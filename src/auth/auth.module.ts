import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MailModule } from '../mail/mail.module'
import { UserModule } from '../user/user.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { PasswordResetToken } from './entities/password-reset-token.entity'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { RulesGuard } from './guards/rules.guard'
import { PasswordResetService } from './password-reset.service'
import { JwtStrategy } from './strategies/jwt.strategy'

@Module({
  imports: [
    UserModule,
    MailModule,
    TypeOrmModule.forFeature([PasswordResetToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: Number(configService.get<string>('JWT_EXPIRATION_TIME')),
          issuer: configService.get<string>('JWT_ISSUER'),
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    PasswordResetService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RulesGuard,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
