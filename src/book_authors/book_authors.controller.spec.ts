import { Test, TestingModule } from '@nestjs/testing';
import { BookAuthorsController } from './book_authors.controller.js';

describe('BookAuthorsController', () => {
  let controller: BookAuthorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookAuthorsController],
    }).compile();

    controller = module.get<BookAuthorsController>(BookAuthorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
