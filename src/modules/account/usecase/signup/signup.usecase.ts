import * as bcrypt from 'bcryptjs';
import { AccountGateway } from '../../gateway/account.gateway';
import { User } from '../../domain/user.entity';
import { EntityValidationError } from '@/modules/@shared/domain/errors/unprocessable-entity.error';
import {
  SignupInputDto,
  SignupOutputDto,
  SignupUseCaseInterface,
} from './signup.usecase.dto';

export class SignupUseCase implements SignupUseCaseInterface {
  constructor(
    private readonly accountRepository: AccountGateway,
    private readonly signToken: (payload: {
      memberId: string;
      organizationId: string;
      role: string;
    }) => string,
  ) {}

  async execute(input: SignupInputDto): Promise<SignupOutputDto> {
    const existing = await this.accountRepository.findByEmail(input.email);

    if (existing) {
      throw new EntityValidationError([
        { email: ['Este email já está em uso.'] },
      ]);
    }

    const hashedPassword = bcrypt.hashSync(input.password, 10);

    const user = User.create({
      email: input.email,
      name: input.name,
      password: hashedPassword,
    });

    const slug = this.generateSlug(input.organizationName);

    // Criação atômica: User + Organization + Member em uma única transação.
    // Se a rede cair entre as escritas, o Postgres reverte tudo — zero dados corrompidos.
    const { organizationId, member } =
      await this.accountRepository.createSignupAtomically({
        user,
        organization: { name: input.organizationName, slug },
        memberRole: 'ADMIN',
      });

    const token = this.signToken({
      memberId: member.id,
      organizationId,
      role: member.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      organization: {
        id: organizationId,
        name: input.organizationName,
        slug,
      },
      memberId: member.id,
    };
  }

  private generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    const suffix = Math.random().toString(36).substring(2, 8);
    return `${base}-${suffix}`;
  }
}
