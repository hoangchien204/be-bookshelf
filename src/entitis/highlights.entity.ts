import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Book } from './book.entity';

@Entity('highlights')
export class Highlight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Ai tạo highlight
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  // Thuộc sách nào
  @ManyToOne(() => Book, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookId' })
  book: Book;

  @Column({ type: 'uuid' })
  bookId: string;

  // Thông tin highlight
  @Column()
  pageNumber: number;

  @Column()
  startOffset: number;

  @Column()
  endOffset: number;

  @Column({ default: '#FFFF00' })
  color: string;

  // Ghi chú kèm theo highlight
  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
