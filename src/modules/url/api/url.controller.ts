import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ShortenUrlDto } from '../application/dtos/shorten-url.dto';
import { UrlService } from '../application/service/url.service';
import { Response } from 'express';

@Controller()
export class UrlController {
  constructor(private urlService: UrlService) {}

  @Get(':code')
  async redirect(@Param('code') code: string, @Res() res: Response) {
    const longUrl = await this.urlService.findByShortUrl(code);
    res.redirect(longUrl);
  }

  @HttpCode(HttpStatus.OK)
  @Post()
  async shortenUrl(@Body() shortenUrlDto: ShortenUrlDto) {
    const url = await this.urlService.shortenUrl(shortenUrlDto);
    return { redirect: url };
  }

  // @Get('stats/:id')
  // async stats(@Param('id') id: number) {
  //   const res = await this.urlService.getStats(id);
  //   return {
  //     countVisit: res.visitCount,
  //   };
  // }
}
