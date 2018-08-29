import { Injectable } from '@angular/core';
import { BaseRepository } from './base';
import { environment } from '../../environments/environment';

@Injectable()
export class PouchDBRepository extends BaseRepository {
  protected account: string = null;

  protected database = null;

  protected onChangesFn: () => void = null;

  protected syncHandler: any = null;

  protected url = 'https://couchdb.offline-notepad.com';

  constructor() {
    super();

    this.account = localStorage.getItem('account');

    if (!this.account) {
      this.account = this.generateAccountId();

      localStorage.setItem('account', this.account);
    }

    this.initialize();
  }

  public async deleteTab(name: string): Promise<void> {
    const document: any = await this.database.get(`${this.account}-${name}`);

    await this.database.remove(document);
  }

  public async getTabContent(name: string): Promise<string> {
    try {
      const document: any = await this.database.get(`${this.account}-${name}`);

      if (!document) {
        return null;
      }

      return document.content;
    } catch {
      return null;
    }
  }

  public async insertTab(name: string, content: string): Promise<void> {
    await this.database.put({
      _id: `${this.account}-${name}`,
      account: this.account,
      content,
      name,
    });
  }

  public async listTabNames(): Promise<Array<string>> {
    const result: any = await this.database.allDocs({
      include_docs: true,
    });

    return result.rows.filter((row: any) => row.doc.account === this.account).map((row: any) => row.doc.name);
  }

  public onChanges(fn: () => Promise<void>): void {
    this.onChangesFn = fn;
  }

  public async setAccount(account: string): Promise<void> {
    this.account = account;
  }

  public async updateTab(name: string, content: string): Promise<void> {
    const document: any = await this.database.get(`${this.account}-${name}`);

    if (!document) {
      return null;
    }

    await this.database.put({
      _id: `${this.account}-${name}`,
      _rev: document._rev,
      account: this.account,
      content,
      name,
    });
  }

  protected generateAccountId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (str) => {
      // tslint:disable-next-line:no-bitwise
      const randomNumber: number = (Math.random() * 16) | 0;

      // tslint:disable-next-line:no-bitwise
      const value: number = str === 'x' ? randomNumber : (randomNumber & 0x3) | 0x8;
      return value.toString(16);
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
