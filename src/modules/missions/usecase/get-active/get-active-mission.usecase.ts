import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma.service';

@Injectable()
export class GetActiveMissionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  public async execute(missionId: string) {
    const mission = await this.prisma.mission.findUnique({
      where: { id: missionId },
      include: { versions: true },
    });

    if (!mission) {
      throw new NotFoundException(`Jacaré não achou a missão: ${missionId}`);
    }

    if (!mission.activeHash) {
      throw new NotFoundException(
        `A missão ${missionId} existe, mas não tem versão publicada.`,
      );
    }

    const activeVersion = mission.versions.find(
      (v) => v.hash === mission.activeHash,
    );

    if (!activeVersion) {
      throw new Error(
        'Estado corrompido: O Hash ativo não aponta para nenhuma versão!',
      );
    }

    return activeVersion.missionData;
  }
}
