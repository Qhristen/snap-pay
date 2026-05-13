import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchUserDto {
  @ApiPropertyOptional({ description: 'Search query (username or email)', minLength: 2 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  query: string;

  @ApiPropertyOptional({ description: 'Number of results to return', default: 10, maximum: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit: number = 10;
}
