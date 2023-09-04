import { Injectable, NotFoundException } from '@nestjs/common';
import { ShortenUrlDto } from '../dtos/shorten-url.dto';
import { Url } from '../../domain/models/url.model';
import { add } from 'date-fns';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvType } from '../../../../core/common/config/env.config';
import { nanoid } from 'nanoid';
import { ProxyUrlRepository } from '../../infrastructure/proxy-url.repository';

@Injectable()
export class UrlService {
  constructor(
    private proxyUrlRepository: ProxyUrlRepository,
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

    await this.proxyUrlRepository.save(urlModel);

    return urlModel;
  }

  async findByShortUrl(url: string): Promise<string> {
    const urlModel = await this.proxyUrlRepository.findByShortUrl(url);

    if (!urlModel) {
      console.warn('ulr model not found');
      throw new NotFoundException();
    }

    await this.proxyUrlRepository.incrementVisitCount(urlModel);
    return urlModel.longUrl;
  }

  async getStats(url: string) {
    const urlModel = await this.proxyUrlRepository.getStats(url);
    if (!urlModel) {
      console.warn('ulr model not found');
      throw new NotFoundException();
    }
    return urlModel;
  }
}
