// src/books/book.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Series } from './series.entity';
import { Comment } from './comment.entity';
import { Rating } from './rating.entity';
import { Genre } from './genre.entity';
import { Highlight } from './highlights.entity';

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

  @ManyToMany(() => Genre, (genre) => genre.books, { cascade: true })
  @JoinTable({
    name: 'book_genres',
    joinColumn: { name: 'bookId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'genreId', referencedColumnName: 'id' },
  })
  genres: Genre[];

  @ManyToOne(() => Genre, (genre) => genre.books, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'genreId' })
  genre: Genre;

  @Column({ type: 'uuid', nullable: true })
  genreId: string | null;

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

  @OneToMany(() => Highlight, (highlight) => highlight.book)
  highlights: Highlight[];

  @Column({ type: 'uuid', nullable: true })
  seriesId?: string | null;

  @Column({ type: 'int', nullable: true })
  volumeNumber?: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Rating, (ratings) => ratings.book)
  ratings: Rating[];

  // block chain
  @Column({ nullable: true })
  ipfsCid: string;

  @Column({ nullable: true })
  blockchainTx: string;

  @Column({ nullable: true })
  ipfsGatewayUrl: string;

  @Column({ nullable: true })
  metadataCid: string;
}



