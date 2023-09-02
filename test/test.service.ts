import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class TestsService {
  constructor(private readonly sequelize: Sequelize) {}
  async clearDb() {
    await this.sequelize.query(`TRUNCATE "urls" RESTART IDENTITY CASCADE`);
  }
}
