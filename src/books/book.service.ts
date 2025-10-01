import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Book } from '../entitis/book.entity';
import { SeriesService } from '../series/series.service';
import { UploadService } from 'src/upload/upload.service';
import { Genre } from 'src/entitis/genre.entity';

function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .toLowerCase();
}

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    private readonly seriesService: SeriesService,
    private readonly uploadService: UploadService,
  ) { }

  // Lấy tất cả sách
  findAll(filter?: { isSeries?: boolean }) {
    return this.bookRepository.find({
      where: filter?.isSeries !== undefined ? { isSeries: filter.isSeries } : {},
      relations: ['series', 'genre', 'genres'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const book = await this.bookRepository.findOne({ where: { id }, relations: ['series', 'genre', 'genres'] });
    if (!book) throw new NotFoundException(`Book with id ${id} not found`);
    return book;
  }

  // Create sách kèm upload + series

  async createBook(
    files: { bookFile?: Express.Multer.File[]; cover?: Express.Multer.File[] },
    body: any,
  ) {
    const bookFile = files.bookFile?.[0];
    const cover = files.cover?.[0];
    if (!bookFile || !cover) throw new BadRequestException('Thiếu file PDF hoặc ảnh bìa');

    const allowedTypes = ['application/pdf', 'application/epub+zip'];
    if (!allowedTypes.includes(bookFile.mimetype)) {
      throw new BadRequestException('Chỉ hỗ trợ PDF hoặc EPUB');
    }

    // xử lý series
    let seriesId = body.seriesId || null;
    const isSeries = String(body.isSeries).toLowerCase() === 'true';
    if (isSeries && !seriesId && body.seriesTitleNew?.trim()) {
      const newSeries = await this.seriesService.create({ title: body.seriesTitleNew.trim() });
      seriesId = newSeries.id;
    }

    // xử lý upload
    const rawName = body.name.trim().replace(/\s+/g, '_');
    const fileBaseName = removeVietnameseTones(rawName.replace(/\.[^/.]+$/, ''));
    const fileExt = bookFile.mimetype === 'application/pdf' ? 'pdf' : 'epub';
    const bookUpload = await this.uploadService.uploadFile(
      bookFile,
      `books/${fileExt}`,
      `${fileBaseName}.${fileExt}`,
    );
    const coverUpload = await this.uploadService.uploadFile(
      cover,
      'books/covers',
      `${fileBaseName}-cover.jpg`,
    );

    // Tạo entity book
    const book = this.bookRepository.create({
      name: body.name,
      author: body.author,
      description: body.description || '',
      fileUrl: bookUpload.url,
      coverUrl: coverUpload.url,
      fileType: fileExt,
      isSeries,
      seriesId,
      volumeNumber: isSeries ? Number(body.volumeNumber) || 1 : null,
    });

    // Xử lý nhiều thể loại
    let genresArray: string[] = [];
    if (body.genres) {
      try {
        genresArray = typeof body.genres === 'string'
          ? JSON.parse(body.genres)
          : body.genres;
      } catch {
        throw new BadRequestException('genres phải là mảng id hợp lệ');
      }

      if (Array.isArray(genresArray) && genresArray.length > 0) {
        const genreEntities = await this.bookRepository.manager
          .getRepository(Genre)
          .findBy({ id: In(genresArray) });
        book.genres = genreEntities;
      }
    }

    return this.bookRepository.save(book);
  }

  // Update sách kèm upload file mới
  async updateBook(id: string, file?: Express.Multer.File, body?: any) {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['genres'], // load multi genres
    });
    if (!book) throw new NotFoundException('Không tìm thấy sách');

    // update file
    if (file) {
      const rawName = book.name.trim().replace(/\s+/g, '_');
      const fileBaseName = removeVietnameseTones(rawName.replace(/\.[^/.]+$/, ''));
      const upload = await this.uploadService.uploadFile(
        file,
        'books/files',
        `${fileBaseName}.${file.mimetype === 'application/epub+zip' ? 'epub' : 'pdf'}`,
      );
      book.fileUrl = upload.url;
      book.fileType = file.mimetype === 'application/epub+zip' ? 'epub' : 'pdf';
    }

    let genresArray: string[] = [];
    if (body.genres) {
      try {
        genresArray = typeof body.genres === 'string'
          ? JSON.parse(body.genres)   // parse nếu là string
          : body.genres;
      } catch {
        throw new BadRequestException('genres phải là mảng id hợp lệ');
      }
    }

    if (Array.isArray(genresArray) && genresArray.length > 0) {
      const genreEntities = await this.bookRepository.manager
        .getRepository(Genre)
        .findBy({ id: In(genresArray) });
      book.genres = genreEntities;
    }

    return this.bookRepository.save(book);
  }


  // Create đơn giản 
  async create(bookData: Partial<Book> & { seriesTitleNew?: string; isSeries?: boolean }) {
    let seriesId = bookData.seriesId || null;
    if (bookData.isSeries && !seriesId && bookData.seriesTitleNew) {
      const newSeries = await this.seriesService.create({ title: bookData.seriesTitleNew.trim() });
      seriesId = newSeries.id;
    }
    const book = this.bookRepository.create({ ...bookData, seriesId });
    return this.bookRepository.save(book);
  }

  // Tìm theo tác giả
  async findByAuthor(author: string) {
    return this.bookRepository.find({ where: { author }, order: { createdAt: 'DESC' } });
  }

  // Tìm theo series
  async findBySeries(seriesId: string) {
    return this.bookRepository.find({ where: { seriesId }, order: { volumeNumber: 'ASC' } });
  }

  async update(id: string, updateData: Partial<Book>) {
    const book = await this.bookRepository.findOneBy({ id });
    if (!book) throw new NotFoundException('Không tìm thấy sách');
    Object.assign(book, updateData);
    return this.bookRepository.save(book);
  }

  // Xóa
  async remove(id: string) {
    const book = await this.bookRepository.findOneBy({ id });
    if (!book) throw new NotFoundException('Không tìm thấy sách');
    return this.bookRepository.remove(book);
  }

  // Suggest sách ngẫu nhiên
  async suggestBooks(currentBookId: string, limit = 10) {
    const current = await this.bookRepository.findOne({ where: { id: currentBookId } });
    if (!current) throw new NotFoundException('Book not found');

    return this.bookRepository
      .createQueryBuilder('book')
      .where('book.id != :id', { id: currentBookId })
      .andWhere('book.author != :author', { author: current.author })
      .orderBy('RANDOM()')
      .limit(limit)
      .getMany();
  }
}
