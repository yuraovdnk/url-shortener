import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class ShortenUrlDto {
  @IsUrl()
  @IsString()
  @IsNotEmpty()
  url: string;
}
