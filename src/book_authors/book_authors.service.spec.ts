import { Test, TestingModule } from '@nestjs/testing';
import { BookAuthorsService } from './book_authors.service.js';

describe('BookAuthorsService', () => {
  let service: BookAuthorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookAuthorsService],
    }).compile();

    service = module.get<BookAuthorsService>(BookAuthorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
