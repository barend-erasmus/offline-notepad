import { environment } from '../../environments/environment';
import { TextHelper } from '../helpers/text';
import { EventEmitter } from '@angular/core';

export class Tab {
  protected static database: any = null;

  public static eventEmitter: EventEmitter<any> = new EventEmitter();

  protected static syncHandler: any = null;

  protected static url = 'https://couchdb.offline-notepad.com';

  constructor(
    public id: string,
    public name: string,
    public content: string,
    public order: number,
    public deleted: boolean,
  ) {}

  public static async create(order: number): Promise<Tab> {
    const tab: Tab = new Tab(null, 'new', 'Hello World', order, false);

    return tab;
  }

  public static async loadAll(account: string): Promise<Array<Tab>> {
    const result: any = await (await Tab.getDatabase(account)).allDocs({
      include_docs: true,
    });

    return result.rows
      .filter((row: any) => row.doc.account === account)
      .map((row: any) => new Tab(row.doc._id, row.doc.name, row.doc.content, row.doc.order, row.doc.deleted))
      .filter((tab: Tab) => !tab.deleted)
      .sort((a: Tab, b: Tab) => b.order - a.order);
  }

  protected static getDatabase(account: string): Promise<any> {
    if (Tab.database) {
      return Tab.database;
    }

    if (Tab.syncHandler) {
      Tab.syncHandler.cancel();
    }

    const databaseName = `offline-notepad-${environment.version}`;

    Tab.database = new (window as any).PouchDB(databaseName, { auto_compaction: true });

    // Tab.syncHandler = (window as any).PouchDB.sync(databaseName, `${Tab.url}/offline-notepad`, {
    //   live: true,
    //   retry: true,
    // }).on('change', (info: any) => {
    //   if (info.change.docs.filter((doc: any) => doc.account === account).length > 0) {
    //     Tab.eventEmitter.emit();
    //   }
    // });

    return Tab.database;
  }

  protected static async insert(account: string, tab: Tab): Promise<Tab> {
    if (!tab.id) {
      tab.id = TextHelper.generateUUID();
    }

    await (await Tab.getDatabase(account)).put({
      _id: tab.id,
      account,
      content: tab.content,
      deleted: tab.deleted,
      name: tab.name,
      order: tab.order,
    });

    return tab;
  }

  protected static async update(account: string, tab: Tab): Promise<Tab> {
    const document: any = await (await Tab.getDatabase(account)).get(tab.id);

    if (!document) {
      return null;
    }

    await (await Tab.getDatabase(account)).put({
      _id: tab.id,
      _rev: document._rev,
      account: account,
      content: tab.content,
      deleted: tab.deleted,
      name: tab.name,
      order: tab.order,
    });
  }

  public async delete(account: string): Promise<void> {
    this.deleted = true;

    await this.save(account);
  }

  public async save(account: string): Promise<Tab> {
    if (!this.id) {
      await Tab.insert(account, this);
    }

    await Tab.update(account, this);

    return this;
  }
}
