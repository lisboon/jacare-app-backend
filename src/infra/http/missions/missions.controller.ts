import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { GetActiveMissionUseCase } from '@/domain/missions/usecase/get-active/get-active-mission.usecase';

@Controller('missions')
export class MissionsController {
  constructor(
    private readonly getActiveMissionUseCase: GetActiveMissionUseCase,
  ) {}

  @Get('active')
  async getActiveMission() {
    try {
      const mission = await this.getActiveMissionUseCase.execute();

      return {
        mission_id: mission.id,
        target_actor: {
          class_path: mission.targetActor.classPath,
          spawn_location: {
            X: mission.targetActor.spawnLocation.x,
            Y: mission.targetActor.spawnLocation.y,
            Z: mission.targetActor.spawnLocation.z,
          },
        },
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
