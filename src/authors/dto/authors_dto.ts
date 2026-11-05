import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAuthorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;
}

export class UpdateAuthorDto extends PartialType(CreateAuthorDto) {}