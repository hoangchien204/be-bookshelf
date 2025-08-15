// src/series/series.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Book } from './book.entity';

@Entity('series')
export class Series {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  title: string; 

  @Column('text', { nullable: true })
  description?: string;

  @Column({ nullable: true })
  coverUrl?: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Book, (book) => book.series)
  books: Book[];
}
