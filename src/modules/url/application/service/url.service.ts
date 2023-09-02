import { Injectable, NotFoundException } from '@nestjs/common';
import { ShortenUrlDto } from '../dtos/shorten-url.dto';
import { UrlRepository } from '../../infrastructure/url.repository';
import { Url } from '../../domain/models/url.model';
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

  async shortenUrl(shortenUrlDto: ShortenUrlDto): Promise<Url> {
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

    return urlModel;
  }

  async findByShortUrl(url: string): Promise<string> {
    const urlModel = await this.urlRepo.findByShortUrl(url);

    if (!urlModel) {
      console.warn('ulr model not found');
      throw new NotFoundException();
    }

    await this.urlRepo.incrementVisitCount(urlModel);
    return urlModel.longUrl;
  }

  async getStats(url: string) {
    const urlModel = await this.urlRepo.getStats(url);
    if (!urlModel) {
      console.warn('ulr model not found');
      throw new NotFoundException();
    }
    return urlModel;
  }
}
