import { Module } from '@nestjs/common';
import { GetActiveMissionUseCase } from '@/domain/missions/usecase/get-active/get-active-mission.usecase';
import { MissionsController } from './missions.controller';

@Module({
  controllers: [MissionsController],
  providers: [GetActiveMissionUseCase], // Registra o Use Case no injetor de dependências
})
export class MissionsModule {}
