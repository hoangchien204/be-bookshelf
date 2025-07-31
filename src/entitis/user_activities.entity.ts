import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Book } from './book.entity';

@Entity('user_activities')
@Unique(['user', 'book']) // mỗi user chỉ có 1 dòng cho mỗi book
export class UserActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Book, { onDelete: 'CASCADE' })
  book: Book;

  @Column({ type: 'int', nullable: true })
  lastPage?: number;

  @Column({ default: false })
  isFavorite: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
