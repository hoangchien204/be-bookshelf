import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { Book } from "./book.entity";
import { User } from "./user.entity";

@Entity('ratings')
@Unique(['userId', 'bookId'])
export class Rating{
  @PrimaryGeneratedColumn('uuid')
  id: string
    
  @Column({type: 'int', width: 1})
  score: number

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({type: 'text', nullable: true})
  content: string

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.ratings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Book, (book) => book.ratings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookId' })
  book: Book;

  @Column({ type: 'uuid' })
  bookId: string;
}