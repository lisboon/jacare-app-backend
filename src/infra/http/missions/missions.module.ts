import { Module } from '@nestjs/common';
import { GetActiveMissionUseCase } from '@/modules/missions/usecase/get-active/get-active-mission.usecase';
import { MissionsController } from './missions.controller';
import { PrismaService } from '@/infra/database/prisma.service';

@Module({
  controllers: [MissionsController],
  providers: [PrismaService, GetActiveMissionUseCase],
})
export class MissionsModule {}
