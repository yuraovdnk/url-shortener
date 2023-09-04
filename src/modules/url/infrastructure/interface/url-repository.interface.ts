import { Url } from '../../domain/models/url.model';

export abstract class IUrlRepository {
  abstract findByShortUrl(url: string): Promise<Url | null>;
  abstract incrementVisitCount(urlModel: Url): Promise<void>;
  abstract getStats(url: string): Promise<Url>;
  abstract clearExpiredUrls(): Promise<void>;
  abstract save(urlModel: Url): Promise<void>;
}
