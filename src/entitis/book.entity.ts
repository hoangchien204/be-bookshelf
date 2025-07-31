// src/books/book.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  author: string;

  @Column('text')
  description: string;

  @Column()
  genre: string;

  @Column()
  coverUrl: string;

  @Column()
  fileUrl: string;

  @Column({ default: 'pdf' })
  fileType: string;

  @CreateDateColumn()
  createdAt: Date;
}



