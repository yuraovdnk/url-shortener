import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Url } from '../domain/entity/url.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
@Injectable()
export class UrlRepository {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectModel(Url)
    private urlModel: typeof Url,
  ) {}

  async save(urlModel: Url) {
    await urlModel.save();
  }

  async findByShortUrl(url: string) {
    let cache = await this.cacheManager.get<Url>(url);
    if (!cache) {
      cache = await this.urlModel.findOne({
        where: {
          shortUrl: url,
        },
      });

      if (!cache) return null;
      await this.cacheManager.set(url, cache, 0);
    }

    return cache;
  }

  async incrementCount(urlModel: Url) {
    await this.urlModel.update(
      {
        visitCount: urlModel.visitCount + 1,
      },
      {
        where: {
          id: urlModel.id,
        },
      },
    );
  }

  findById(id: number) {
    return this.urlModel.findOne({
      where: {
        id,
      },
    });
  }
}
