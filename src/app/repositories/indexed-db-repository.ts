import { Injectable } from '@angular/core';
import idb, { UpgradeDB, ObjectStore, Transaction, DB } from 'idb';
import { BaseRepository } from './base';
import { environment } from '../../environments/environment';
import { Tab } from '../models/tab';

@Injectable()
export class IndexedDBRepository extends BaseRepository {
  constructor() {
    super();
  }

  public async delete(tab: Tab): Promise<void> {
    const objectStore: ObjectStore<any, any> = await this.getObjectStore();

    await objectStore.delete(tab.id);
  }

  public async insert(tab: Tab): Promise<void> {
    if (!tab.id) {
      tab.id = this.genereateUUID();
    }

    const objectStore: ObjectStore<any, any> = await this.getObjectStore();

    objectStore.add(tab);
  }

  public async list(): Promise<Array<Tab>> {
    const objectStore: ObjectStore<any, any> = await this.getObjectStore();

    const tabs: Array<Tab> = await objectStore.getAll();

    return tabs;
  }

  public onChanges(fn: () => Promise<void>): void {}

  public async update(tab: Tab): Promise<void> {
    const objectStore: ObjectStore<any, any> = await this.getObjectStore();

    objectStore.put(tab);
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
