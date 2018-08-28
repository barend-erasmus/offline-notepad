import { Injectable } from '@angular/core';
import idb, { UpgradeDB, ObjectStore, Transaction, DB } from 'idb';
import { BaseRepository } from './base';

@Injectable()
export class IndexedDBRepository extends BaseRepository {
  protected objectStore: ObjectStore<any, any> = null;

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

  public onChanges(fn: () => Promise<void>): void {

  }

  public async updateTab(name: string, content: string): Promise<void> {
    const objectStore: ObjectStore<any, any> = await this.getObjectStore();

    objectStore.put({
      content,
      id: name,
    });
  }

  protected async getObjectStore(): Promise<ObjectStore<any, any>> {
    if (this.objectStore) {
      return this.objectStore;
    }

    const database: DB = await idb.open('offline-notepad', 1, (upgradeDB: UpgradeDB) => {
      upgradeDB.createObjectStore('tabs', { keyPath: 'id' });
    });

    const transaction: Transaction = database.transaction('tabs', 'readwrite');

    const objectStore: ObjectStore<any, any> = transaction.objectStore('tabs');

    this.objectStore = objectStore;

    return  this.objectStore;
  }
}
