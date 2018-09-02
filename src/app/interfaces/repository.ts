import { Tab } from '../models/tab';

export interface IRepository {
  getSelectedTabId(): Promise<string>;

  list(): Promise<Array<Tab>>;

  onChanges(fn: () => Promise<void>): void;

  resetAccount(): Promise<void>;

  setAccount(account: string): Promise<void>;

  upsert(tab: Tab): Promise<Tab>;
}
