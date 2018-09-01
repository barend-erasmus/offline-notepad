import { Injectable } from '@angular/core';
import { BaseRepository } from './base';
import { environment } from '../../environments/environment';
import { Tab } from '../models/tab';

@Injectable()
export class PouchDBRepository extends BaseRepository {
  protected account: string = null;

  protected database = null;

  protected onChangesFn: () => void = null;

  protected syncHandler: any = null;

  protected url = 'https://couchdb.offline-notepad.com';

  constructor() {
    super();

    this.resetAccount();

    this.initialize();
  }

  public async delete(tab: Tab): Promise<void> {
    const document: any = await this.database.get(tab.id);

    if (!document) {
      return null;
    }

    tab.deleted = true;

    await this.database.put({
      _id: tab.id,
      _rev: document._rev,
      account: this.account,
      content: tab.content,
      deleted: tab.deleted,
      name: tab.name,
      order: tab.order,
    });
  }

  public async insert(tab: Tab): Promise<void> {
    if (!tab.id) {
      tab.id = this.genereateUUID();
    }

    await this.database.put({
      _id: tab.id,
      account: this.account,
      content: tab.content,
      deleted: tab.deleted,
      name: tab.name,
      order: tab.order,
    });
  }

  public async list(): Promise<Array<Tab>> {
    const result: any = await this.database.allDocs({
      include_docs: true,
    });

    return result.rows
      .filter((row: any) => row.doc.account === this.account)
      .map((row: any) => new Tab(row.doc._id, row.doc.name, row.doc.content, row.doc.order, row.doc.deleted));
  }

  public onChanges(fn: () => Promise<void>): void {
    this.onChangesFn = fn;
  }

  public async resetAccount(): Promise<void> {
    this.account = localStorage.getItem('account');

    if (!this.account) {
      this.account = this.genereateUUID();

      localStorage.setItem('account', this.account);
    }
  }

  public async setAccount(account: string): Promise<void> {
    this.account = account;
  }

  public async update(tab: Tab): Promise<void> {
    if (!tab.id) {
      await this.insert(tab);
    }

    const document: any = await this.database.get(tab.id);

    if (!document) {
      return null;
    }

    await this.database.put({
      _id: tab.id,
      _rev: document._rev,
      account: this.account,
      content: tab.content,
      deleted: tab.deleted,
      name: tab.name,
      order: tab.order,
    });
  }

  protected initialize(): void {
    if (this.syncHandler) {
      this.syncHandler.cancel();
    }

    const databaseName = `offline-notepad-${environment.version}`;

    this.database = new (window as any).PouchDB(databaseName, { auto_compaction: true });

    this.syncHandler = (window as any).PouchDB.sync(databaseName, `${this.url}/offline-notepad`, {
      live: true,
      retry: true,
    })
      .on('change', (info: any) => {
        if (this.onChangesFn && info.change.docs.filter((doc: any) => doc.account === this.account).length > 0) {
          this.onChangesFn();
        }
      })
      .on('paused', (error: Error) => {})
      .on('active', () => {})
      .on('denied', (error: Error) => {})
      .on('complete', (info: any) => {})
      .on('error', (error: Error) => {});
  }
}
