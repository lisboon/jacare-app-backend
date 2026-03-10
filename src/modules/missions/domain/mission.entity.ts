export class TargetActor {
  constructor(
    public readonly classPath: string,
    public readonly spawnLocation: { x: number; y: number; z: number },
  ) {}
}

export class Mission {
  constructor(
    public readonly id: string,
    public readonly targetActor: TargetActor,
  ) {}

  public isValid(): boolean {
    return this.targetActor.classPath.endsWith('_C'); // Regra AAA estabelecida
  }
}
