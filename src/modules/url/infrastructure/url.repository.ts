import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Url } from '../domain/models/url.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import sequelize, { Op } from 'sequelize';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvType } from '../../../core/common/config/env.config';
import { IUrlRepository } from './interface/url-repository.interface';

@Injectable()
export class UrlRepository implements IUrlRepository {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectModel(Url)
    private urlModel: typeof Url,
    private configService: ConfigService<ConfigEnvType, true>,
  ) {}

  async save(urlModel: Url) {
    await urlModel.save();
  }

  async findByShortUrl(url: string): Promise<Url | null> {
    let urlModel: Url;
    urlModel = await this.cacheManager.get<Url>(url);
    if (!urlModel) {
      urlModel = await this.urlModel.findOne({
        where: {
          shortUrl: url,
        },
      });

      if (!urlModel) return null;
      const ttl = this.configService.get('settings', { infer: true }).redisTtl;
      await this.cacheManager.set(url, urlModel, +ttl);
    }
    return urlModel;
  }

  async incrementVisitCount(urlModel: Url) {
    await this.urlModel.update(
      {
        visitCount: sequelize.literal('"visit_count" + 1'),
      },
      {
        where: {
          id: urlModel.id,
        },
      },
    );
  }

  async getStats(url: string): Promise<Url> {
    return await this.urlModel.findOne({
      where: {
        shortUrl: url,
      },
    });
  }

  async clearExpiredUrls() {
    await this.urlModel.destroy({
      where: {
        expiresAt: {
          [Op.lt]: new Date(),
        },
      },
    });
  }
}
