import { Url } from '../../domain/models/url.model';

export interface IUrlRepository {
  findByShortUrl(url: string): Promise<Url | null>;
  incrementVisitCount(urlModel: Url);
  getStats(url: string): Promise<Url>;
}
