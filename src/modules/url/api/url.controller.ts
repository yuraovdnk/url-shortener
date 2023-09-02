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
import { ShortenUrlViewModel } from '../application/dtos/shorten-url.view-model';
import { StatsViewModel } from '../application/dtos/stats.view-model';
import { SkipThrottle } from '@nestjs/throttler';

@Controller()
export class UrlController {
  constructor(private urlService: UrlService) {}

  @SkipThrottle(true)
  @Get('stats/:url')
  async stats(@Param('url') shortUrl: string) {
    const urlModel = await this.urlService.getStats(shortUrl);
    return new StatsViewModel(urlModel);
  }

  @SkipThrottle(true)
  @Get(':code')
  async redirect(@Param('code') code: string, @Res() res: Response) {
    const longUrl = await this.urlService.findByShortUrl(code);
    res.redirect(longUrl);
  }

  @HttpCode(HttpStatus.OK)
  @Post()
  async shortenUrl(
    @Body() shortenUrlDto: ShortenUrlDto,
  ): Promise<ShortenUrlViewModel> {
    const url = await this.urlService.shortenUrl(shortenUrlDto);
    return new ShortenUrlViewModel(url.shortUrl, url.longUrl);
  }
}
