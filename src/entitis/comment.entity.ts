import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Book } from "./book.entity";
import { User } from './user.entity';

@Entity('comments')
export class Comment  {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column('text')
    content: string

    @CreateDateColumn()
    createdAt: Date;
    
    @Column({ type: 'uuid' })
    bookId: string;
    
    @ManyToOne(() => Book, (book) => book.comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'bookId' })
    book: Book;

    @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'uuid' })
    userId: string;
}