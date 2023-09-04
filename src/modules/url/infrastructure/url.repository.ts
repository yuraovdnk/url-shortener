import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Url } from '../domain/models/url.model';
import sequelize, { Op } from 'sequelize';
import { IUrlRepository } from './interface/url-repository.interface';

@Injectable()
export class UrlRepository implements IUrlRepository {
  constructor(
    @InjectModel(Url)
    private urlModel: typeof Url,
  ) {}

  async save(urlModel: Url) {
    await urlModel.save();
  }

  async findByShortUrl(url: string): Promise<Url | null> {
    return await this.urlModel.findOne({
      where: {
        shortUrl: url,
      },
    });
  }

  async incrementVisitCount(urlModel: Url): Promise<void> {
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
