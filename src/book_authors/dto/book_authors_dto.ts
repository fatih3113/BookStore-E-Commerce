import { IsOptional, IsUUID } from 'class-validator';

export class CreateBookAuthorDto {
  @IsUUID()
  bookId: string;

  @IsUUID()
  authorId: string;
}

export class FindBookAuthorsQueryDto {
  @IsOptional()
  @IsUUID()
  bookId?: string;

  @IsOptional()
  @IsUUID()
  authorId?: string;
}