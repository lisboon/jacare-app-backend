import { User } from '../domain/user.entity';
import { EMemberRole } from '@prisma/client';

/**
 * Dados do membro com informações do usuário, retornado pelas leituras do gateway.
 */
export interface MemberWithUser {
  memberId: string;
  userId: string;
  organizationId: string;
  role: EMemberRole;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    avatarUrl: string | null;
  };
}

/**
 * Dados necessários para criar uma organização durante o signup.
 */
export interface CreateOrganizationData {
  name: string;
  slug: string;
}

/**
 * Dados necessários para criar o vínculo membro durante o signup.
 */
export interface CreateMemberData {
  userId: string;
  organizationId: string;
  role: EMemberRole;
}

/**
 * Registro de membro retornado após criação.
 */
export interface MemberRecord {
  id: string;
  userId: string;
  organizationId: string;
  role: EMemberRole;
}

/**
 * Payload para criação atômica de User + Organization + Member no signup.
 * Os três registros devem ser criados em uma única transação — se qualquer
 * um falhar, todos os outros são revertidos. (Vaughn Vernon, "Implementing
 * Domain-Driven Design": a transação é a fronteira de consistência do Aggregate.)
 */
export interface SignupAtomicInput {
  user: User;
  organization: CreateOrganizationData;
  memberRole: EMemberRole;
}

/**
 * Resultado da criação atômica: IDs necessários para emitir o JWT.
 */
export interface SignupAtomicResult {
  organizationId: string;
  member: MemberRecord;
}

/**
 * Contrato de persistência do domínio de Account.
 * Gerencia User, Organization e Member em uma única interface
 * porque signup precisa criar os três de forma transacional.
 */
export interface AccountGateway {
  /** Busca um usuário pelo email. Retorna null se não existir. */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Cria User, Organization e Member de forma ATÔMICA em uma única transação.
   * Garante que não existirão registros órfãos se a rede falhar entre as escritas.
   * Substitui as chamadas individuais createUser/createOrganization/createMember
   * no contexto de signup.
   */
  createSignupAtomically(input: SignupAtomicInput): Promise<SignupAtomicResult>;

  /** Busca os dados do membro com informações do usuário e organização. */
  findMemberWithUser(memberId: string): Promise<MemberWithUser | null>;

  /** Busca o primeiro membro de um usuário (para login, quando não sabe o orgId). */
  findFirstMemberByUserId(userId: string): Promise<MemberRecord | null>;
}
