// src/books/book.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Series } from './series.entity';
import { Comment } from './comment.entity';
import { Rating } from './rating.entity';

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

  @Column({ default: false })
  isSeries: boolean;

  @ManyToOne(() => Series, (series) => series.books, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'seriesId' })
  series?: Series | null;

  @OneToMany(() => Comment, (comment) => comment.book)
  comments: Comment[];

  @Column({ type: 'uuid', nullable: true })
  seriesId?: string | null;

  @Column({ type: 'int', nullable: true })
  volumeNumber?: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Rating, (ratings) => ratings.book)
  ratings: Rating[];
}



