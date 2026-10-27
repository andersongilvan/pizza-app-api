import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { UserRole } from '../enums/user-role.enum'

@Entity({ name: 'tb_users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 50 })
  name: string

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  password: string

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STAFF })
  role: UserRole
}
