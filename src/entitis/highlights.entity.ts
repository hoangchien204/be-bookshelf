// src/highlight/highlight.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Book } from './book.entity';

@Entity()
export class Highlight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cfiRange: string; // vị trí trong EPUB

  @Column()
  color: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ nullable: true })
  locationIndex: number; // tuỳ chọn, dùng sau này thay cho "pageNumber"

  @ManyToOne(() => User, (user) => user.highlights, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Book, (book) => book.highlights, { onDelete: 'CASCADE' })
  book: Book;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
