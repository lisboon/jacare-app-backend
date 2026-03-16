import type { User as PrismaUserRow, PrismaClient } from '@prisma/client';
import { User, UserProps } from '../domain/user.entity';
import {
  AccountGateway,
  MemberRecord,
  MemberWithUser,
  SignupAtomicInput,
  SignupAtomicResult,
} from '../gateway/account.gateway';

export class AccountRepository implements AccountGateway {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomainEntity(prismaRow: PrismaUserRow): User {
    return new User({
      id: prismaRow.id,
      email: prismaRow.email,
      name: prismaRow.name,
      password: prismaRow.password,
      avatarUrl: prismaRow.avatarUrl,
      createdAt: prismaRow.createdAt,
      updatedAt: prismaRow.updatedAt,
      deletedAt: prismaRow.deletedAt,
    } satisfies UserProps);
  }

  async findByEmail(email: string): Promise<User | null> {
    const prismaRow = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!prismaRow) return null;
    return this.toDomainEntity(prismaRow);
  }

  /**
   * Cria User, Organization e Member em uma única transação atômica.
   * Se qualquer operação falhar, o Postgres reverte tudo — zero registros órfãos.
   *
   * Vaughn Vernon ("Implementing DDD"): a fronteira de consistência de um Aggregate
   * deve ser garantida pela camada de infraestrutura, não pelo código de domínio.
   * prisma.$transaction() é o adaptador dessa garantia.
   */
  async createSignupAtomically(
    input: SignupAtomicInput,
  ): Promise<SignupAtomicResult> {
    return this.prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: input.user.id,
          email: input.user.email,
          name: input.user.name,
          password: input.user.password,
          avatarUrl: input.user.avatarUrl,
          createdAt: input.user.createdAt,
          updatedAt: input.user.updatedAt,
        },
      });

      const org = await tx.organization.create({
        data: {
          name: input.organization.name,
          slug: input.organization.slug,
        },
      });

      const member = await tx.member.create({
        data: {
          userId: input.user.id,
          organizationId: org.id,
          role: input.memberRole,
        },
      });

      return {
        organizationId: org.id,
        member: {
          id: member.id,
          userId: member.userId,
          organizationId: member.organizationId,
          role: member.role,
        },
      };
    });
  }

  async findMemberWithUser(memberId: string): Promise<MemberWithUser | null> {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!member) return null;

    return {
      memberId: member.id,
      userId: member.userId,
      organizationId: member.organizationId,
      role: member.role,
      user: member.user,
      organization: member.organization,
    };
  }

  async findFirstMemberByUserId(userId: string): Promise<MemberRecord | null> {
    const member = await this.prisma.member.findFirst({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });

    if (!member) return null;

    return {
      id: member.id,
      userId: member.userId,
      organizationId: member.organizationId,
      role: member.role,
    };
  }
}
