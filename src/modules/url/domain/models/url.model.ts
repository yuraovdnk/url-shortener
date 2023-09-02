import { Column, Model, Table } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import * as process from 'process';

@Table({ tableName: 'urls', underscored: true })
export class Url extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  id: number;

  @Column
  longUrl: string;

  @Column({
    get() {
      return process.env.BASE_DOMAIN + this.getDataValue('shortUrl');
    },
  })
  shortUrl: string;

  @Column({
    type: DataTypes.INTEGER,
    defaultValue: 0,
  })
  visitCount: number;

  @Column
  expiresAt: Date;

  static initCreate(dto: {
    shortUrl: string;
    longUrl: string;
    expiresAt: Date;
  }) {
    const url = new Url();
    url.shortUrl = dto.shortUrl;
    url.longUrl = dto.longUrl;
    url.expiresAt = dto.expiresAt;
    return url;
  }
}
