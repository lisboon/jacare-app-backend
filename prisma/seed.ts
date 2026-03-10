import { PrismaClient, EMemberRole, EMissionStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as crypto from 'crypto';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🐊 Iniciando o Seed do Jacare Flow...');

  const org = await prisma.organization.upsert({
    where: { slug: 'jacare-studios' },
    update: {},
    create: {
      name: 'Jacare Studios',
      slug: 'jacare-studios',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'admin@jacare.com' },
    update: {},
    create: {
      email: 'admin@jacare.com',
      name: 'Lead Designer',
      password: 'hashed_password',
    },
  });

  const member = await prisma.member.upsert({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: org.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      organizationId: org.id,
      role: EMemberRole.ADMIN,
    },
  });

  const engineData = {
    mission_id: 'tutorial_01',
    target_actor: {
      class_path:
        "/Game/_Game/Characters/Player/Blueprints/BP_SACharacter.BP_SACharacter_C'",
      spawn_location: { X: 500.0, Y: 500.0, Z: 100.0 },
    },
  };

  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(engineData))
    .digest('hex');

  const mission = await prisma.mission.upsert({
    where: { id: 'tutorial_01' },
    update: { activeHash: hash, status: EMissionStatus.APPROVED },
    create: {
      id: 'tutorial_01',
      organizationId: org.id,
      name: 'O Despertar do Jacaré',
      authorId: member.id,
      status: EMissionStatus.APPROVED,
      activeHash: hash,
    },
  });

  await prisma.missionVersion.upsert({
    where: { hash: hash },
    update: { missionData: engineData },
    create: {
      missionId: mission.id,
      hash: hash,
      authorId: member.id,
      isValid: true,
      graphData: { nodes: [], edges: [] },
      missionData: engineData,
    },
  });

  console.log(
    '🐊 Seed concluído! A missão [tutorial_01] está pronta para a Unreal.',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
