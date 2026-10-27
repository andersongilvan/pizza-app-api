import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity('tb_invites')
export class Invite {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 64, unique: true })
  code: string

  @Column({ name: 'invited_email', type: 'varchar', length: 255 })
  invitedEmail: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date

  @Column({ name: 'used_at', type: 'timestamp', nullable: true })
  usedAt: Date | null
}
