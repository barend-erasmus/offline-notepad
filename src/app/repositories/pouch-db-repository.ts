import { Injectable } from '@angular/core';
import { BaseRepository } from './base';

@Injectable()
export class PouchDBRepository extends BaseRepository {
  protected account = `abc`;

  protected database = null;

  protected onChangesFn: () => void = null;

  protected url = 'http://localhost:5984';

  constructor() {
    super();

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
    const document: any = await this.database.get(name);

    await this.database.remove(document);
  }

  public async getTabContent(name: string): Promise<string> {
    const document: any = await this.database.get(name);

    if (!document) {
      return null;
    }

    return document.content;
  }

  public async insertTab(name: string, content: string): Promise<void> {
    await this.database.put({
      _id: name,
      account: this.account,
      content,
    });
  }

  public async listTabNames(): Promise<Array<string>> {
    const result: any = await this.database.allDocs();

    return result.rows.map((row: any) => row.id);
  }

  public onChanges(fn: () => Promise<void>): void {
    this.onChangesFn = fn;
  }

  public async updateTab(name: string, content: string): Promise<void> {
    const document: any = await this.database.get(name);

    if (!document) {
      return null;
    }

    await this.database.put({
      _id: name,
      _rev: document._rev,
      account: this.account,
      content,
    });
  }
}
