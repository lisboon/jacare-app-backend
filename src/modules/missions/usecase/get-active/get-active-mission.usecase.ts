import { Injectable } from '@nestjs/common';
import { Mission, TargetActor } from '../../domain/mission.entity';

@Injectable()
export class GetActiveMissionUseCase {
  public execute(): Mission {
    const target = new TargetActor(
      '/Game/_Game/Characters/Player/Blueprints/BP_SACharacter.BP_SACharacter_C', // Mude para o seu!
      { x: 500.0, y: 500.0, z: 100.0 },
    );

    const mission = new Mission('tutorial_01', target);

    if (!mission.isValid()) {
      throw new Error('Missão corrompida: Blueprint sem sufixo _C');
    }

    return mission;
  }
}
