import { Url } from '../../domain/models/url.model';

export class StatsViewModel {
  visitCount: number;
  originalUrl: string;
  shortUrl: string;
  constructor(url: Url) {
    this.visitCount = url.visitCount;
    this.originalUrl = url.longUrl;
    this.shortUrl = url.shortUrl;
  }
}
