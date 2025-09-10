// src/highlight/dto/highlight.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateHighlightDto {
  @IsUUID()
  bookId: string;

  @IsNotEmpty()
  @IsString()
  cfiRange: string;

  @IsNotEmpty()
  @IsString()
  color: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  locationIndex?: number;
}

export class UpdateHighlightDto {
  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
