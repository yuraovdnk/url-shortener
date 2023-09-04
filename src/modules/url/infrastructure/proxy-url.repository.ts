import { IUrlRepository } from './interface/url-repository.interface';
import { Url } from '../domain/models/url.model';
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvType } from '../../../core/common/config/env.config';

@Injectable()
export class ProxyUrlRepository implements IUrlRepository {
  constructor(
    private urlRepository: IUrlRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService<ConfigEnvType, true>,
  ) {}

  async findByShortUrl(url: string): Promise<Url | null> {
    let urlModel: Url;
    urlModel = await this.cacheManager.get<Url>(url);
    if (!urlModel) {
      urlModel = await this.urlRepository.findByShortUrl(url);
      if (!urlModel) return null;
      const ttl = this.configService.get('settings', { infer: true }).redisTtl;
      await this.cacheManager.set(url, urlModel, +ttl);
    }
    return urlModel;
  }

  getStats(url: string): Promise<Url> {
    return this.urlRepository.findByShortUrl(url);
  }

  async clearExpiredUrls() {
    return this.urlRepository.clearExpiredUrls();
  }

  async incrementVisitCount(urlModel: Url) {
    return this.urlRepository.incrementVisitCount(urlModel);
  }
  async save(urlModel: Url) {
    return this.urlRepository.save(urlModel);
  }
}
