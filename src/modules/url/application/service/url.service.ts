import { Injectable, NotFoundException } from '@nestjs/common';
import { ShortenUrlDto } from '../dtos/shorten-url.dto';
import { UrlRepository } from '../../infrastructure/url.repository';
import { Url } from '../../domain/entity/url.model';
import { add } from 'date-fns';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvType } from '../../../../core/common/config/env.config';
import { nanoid } from 'nanoid';

@Injectable()
export class UrlService {
  constructor(
    private urlRepo: UrlRepository,
    private configService: ConfigService<ConfigEnvType, true>,
  ) {}

  async shortenUrl(shortenUrlDto: ShortenUrlDto) {
    const envSettings = this.configService.get('settings', { infer: true });

    const createModelDto = {
      shortUrl: nanoid(+envSettings.sizeRandomString),
      longUrl: shortenUrlDto.url,
      expiresAt: add(new Date(), {
        months: +envSettings.expirationUrl,
      }),
    };

    const urlModel = Url.initCreate(createModelDto);
    await this.urlRepo.save(urlModel);
    return urlModel.shortUrl;
  }

  async findByShortUrl(url: string): Promise<string> {
    const urlModel = await this.urlRepo.findByShortUrl(url);
    if (!url) {
      throw new NotFoundException();
    }

    await this.urlRepo.incrementCount(urlModel);
    return urlModel.longUrl;
  }

  // getStats(id: number) {
  //   return this.urlRepo.findById(id);
  // }
}
