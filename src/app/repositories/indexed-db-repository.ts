import { Injectable } from '@angular/core';
import idb, { UpgradeDB, ObjectStore, Transaction, DB } from 'idb';
import { BaseRepository } from './base';
import { environment } from '../../environments/environment';

@Injectable()
export class IndexedDBRepository extends BaseRepository {
  constructor() {
    super();
  }

  public async deleteTab(name: string): Promise<void> {
    const objectStore: ObjectStore<any, any> = await this.getObjectStore();

    await objectStore.delete(name);
  }

  public async getTabContent(name: string): Promise<string> {
    const objectStore: ObjectStore<any, any> = await this.getObjectStore();

    const tab: { content: string; id: string } = await objectStore.get(name);

    if (!tab) {
      return null;
    }

    return tab.content;
  }

  public async insertTab(name: string, content: string): Promise<void> {
    const objectStore: ObjectStore<any, any> = await this.getObjectStore();

    objectStore.add({
      content,
      id: name,
    });
  }

  public async listTabNames(): Promise<Array<string>> {
    const objectStore: ObjectStore<any, any> = await this.getObjectStore();

    const tabs: Array<{ content: string; id: string }> = await objectStore.getAll();

    return tabs.map((tab) => tab.id);
  }

  public onChanges(fn: () => Promise<void>): void {}

  public async updateTab(name: string, content: string): Promise<void> {
    const objectStore: ObjectStore<any, any> = await this.getObjectStore();

    objectStore.put({
      content,
      id: name,
    });
  }

  public async setAccount(account: string): Promise<void> {}

  protected async getObjectStore(): Promise<ObjectStore<any, any>> {
    const databaseName = `offline-notepad-${environment.version}`;

    const database: DB = await idb.open(databaseName, 1, (upgradeDB: UpgradeDB) => {
      upgradeDB.createObjectStore('tabs', { keyPath: 'id' });
    });

    const transaction: Transaction = database.transaction('tabs', 'readwrite');

    const objectStore: ObjectStore<any, any> = transaction.objectStore('tabs');

    return objectStore;
  }
}
