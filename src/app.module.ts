import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SpecialistsModule } from './specialists/specialists.module';
import { Specialist } from './specialists/entities/specialist.entity';
import { databaseConfig } from './database.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: databaseConfig.host,
      port: databaseConfig.port,
      username: databaseConfig.username,
      password: databaseConfig.password,
      database: databaseConfig.database,
      ssl: databaseConfig.useSsl ? { rejectUnauthorized: false } : false,
      entities: [Specialist],
      synchronize: false,
      logging: process.env.NODE_ENV !== 'production',
      retryAttempts: 2,
      retryDelay: 1000,
    }),
    SpecialistsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
