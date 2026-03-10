import { GetActiveMissionUseCase } from '@/modules/missions/usecase/get-active/get-active-mission.usecase';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('missions')
export class MissionsController {
  constructor(private readonly getActiveMission: GetActiveMissionUseCase) {}

  // Rota: GET http://localhost:3000/missions/tutorial_01/active
  @Get(':id/active')
  async getActive(@Param('id') id: string) {
    return this.getActiveMission.execute(id);
  }
}
