import { Cron } from '@nestjs/schedule';

export class TaskService {
  constructor() {}

  @Cron('45 * * * * *')
  handleCron() {}
}
