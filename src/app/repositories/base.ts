export abstract class BaseRepository {
  constructor() {}

  public abstract deleteTab(name: string): Promise<void>;

  public abstract getTabContent(name: string): Promise<string>;

  public abstract insertTab(name: string, content: string): Promise<void>;

  public abstract listTabNames(): Promise<Array<string>>;

  public abstract updateTab(name: string, content: string): Promise<void>;
}
