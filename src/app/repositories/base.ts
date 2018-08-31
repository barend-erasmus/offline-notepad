import { Tab } from '../models/tab';

export abstract class BaseRepository {
  constructor() {}

  public abstract delete(tab: Tab): Promise<void>;

  public abstract insert(tab: Tab): Promise<void>;

  public abstract list(): Promise<Array<Tab>>;

  public abstract onChanges(fn: () => Promise<void>): void;

  public abstract resetAccount(): Promise<void>;

  public abstract setAccount(account: string): Promise<void>;

  public abstract update(tab: Tab): Promise<void>;

  protected genereateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (str) => {
      // tslint:disable-next-line:no-bitwise
      const randomNumber: number = (Math.random() * 16) | 0;

      // tslint:disable-next-line:no-bitwise
      const value: number = str === 'x' ? randomNumber : (randomNumber & 0x3) | 0x8;
      return value.toString(16);
    });
  }
}
