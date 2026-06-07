export interface Repository<T extends { id: string }> {
  save(entity: T): T;
  findById(id: string): T | undefined;
  findAll(): T[];
  delete(id: string): boolean;
  clear(): void;
}

export class InMemoryRepository<T extends { id: string }> implements Repository<T> {
  private readonly items = new Map<string, T>();

  save(entity: T): T {
    this.items.set(entity.id, structuredClone(entity));
    return structuredClone(entity);
  }

  findById(id: string): T | undefined {
    const item = this.items.get(id);
    return item ? structuredClone(item) : undefined;
  }

  findAll(): T[] {
    return Array.from(this.items.values()).map((item) => structuredClone(item));
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }

  clear(): void {
    this.items.clear();
  }
}
