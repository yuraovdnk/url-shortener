import { IUrlRepository } from './interface/url-repository.interface';
import { Url } from '../domain/models/url.model';

export class UrlMongoRepository implements IUrlRepository {
  findByShortUrl(url: string): Promise<Url | null> {
    return Promise.resolve(undefined);
  }

  getStats(url: string): Promise<Url> {
    return Promise.resolve(undefined);
  }

  incrementVisitCount(urlModel: Url) {}

  clearExpiredUrls() {}
}
