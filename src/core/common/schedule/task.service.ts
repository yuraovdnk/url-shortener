import { Cron } from '@nestjs/schedule';
import { UrlRepository } from '../../../modules/url/infrastructure/url.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TaskService {
  constructor(public urlRepo: UrlRepository) {}

  @Cron('0 1 * * *')
  async handleCron() {
    await this.urlRepo.clearExpiredUrls();
  }
}
