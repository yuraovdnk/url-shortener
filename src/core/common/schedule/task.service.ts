import { Cron } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { IUrlRepository } from '../../../modules/url/infrastructure/interface/url-repository.interface';

@Injectable()
export class TaskService {
  constructor(private urlRepository: IUrlRepository) {}

  @Cron('0 1 * * *')
  async handleCron() {
    await this.urlRepository.clearExpiredUrls();
  }
}
