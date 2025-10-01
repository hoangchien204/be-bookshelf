// src/genres/entities/genre.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToMany } from 'typeorm';
import { Book } from './book.entity';

@Entity()
export class Genre {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ unique: true })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Book, (book) => book.genre)
  books: Book[];

   // 🔹 Cho multi (1 sách - nhiều thể loại)
  @ManyToMany(() => Book, (book) => book.genres)
  multiBooks: Book[];
}