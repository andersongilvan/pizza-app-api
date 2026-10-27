import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity('tb_password_reset_tokens')
export class PasswordResetToken {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string

  // Guarda só o hash (SHA-256) do token. O token original existe apenas no email
  @Column({ name: 'token_hash', type: 'varchar', length: 64, unique: true })
  tokenHash: string

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date

  @Column({ name: 'used_at', type: 'timestamp', nullable: true })
  usedAt: Date | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
