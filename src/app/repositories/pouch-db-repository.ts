import { Injectable } from '@angular/core';
import { BaseRepository } from './base';

@Injectable()
export class PouchDBRepository extends BaseRepository {
  protected account: string = null;

  protected database = null;

  protected onChangesFn: () => void = null;

  protected url = 'https://couchdb.offline-notepad.com';

  constructor() {
    super();

    this.account = localStorage.getItem('account');

    if (!this.account) {
      this.account = this.generateAccountId();

      localStorage.setItem('account', this.account);
    }

    this.database = new (window as any).PouchDB('offline-notepad', { auto_compaction: true });

    (window as any).PouchDB.sync('offline-notepad', `${this.url}/offline-notepad`, {
      live: true,
      retry: true,
      pull: {
        filter: (document: any) => {
          return document.account === this.account;
        },
      },
      push: {
        filter: (document: any) => {
          return document.account === this.account;
        },
      },
    })
      .on('change', (info: any) => {
        if (this.onChangesFn && info.direction === 'pull') {
          this.onChangesFn();
        }
      })
      .on('paused', (error: Error) => {})
      .on('active', () => {})
      .on('denied', (error: Error) => {})
      .on('complete', (info: any) => {})
      .on('error', (error: Error) => {});
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

    return result.rows.map((row: any) => row.doc.name);
  }

  public onChanges(fn: () => Promise<void>): void {
    this.onChangesFn = fn;
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
}
