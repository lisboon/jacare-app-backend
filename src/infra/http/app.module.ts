import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MissionsModule } from './missions/missions.module';

@Module({
  imports: [MissionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
