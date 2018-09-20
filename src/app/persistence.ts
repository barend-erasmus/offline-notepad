import { ITab } from '@app/interfaces/tab';
import * as uuid from 'uuid';

export class Persistence {
  protected static database: any = null;

  protected static url = 'https://couchdb.offline-notepad.com';

  public static async findAllTabs(account: string): Promise<Array<ITab>> {
    const result: any = await (await Persistence.getDatabase(account)).allDocs({
      include_docs: true,
    });

    return result.rows
      .filter((row: any) => row.doc.account === account)
      .map((row: any) => {
        return {
          content: row.doc.content,
          deleted: row.doc.deleted,
          editMode: row.doc.editMode,
          id: row.doc._id,
          lineNumbers: row.doc.lineNumbers,
          name: row.doc.name,
          order: row.doc.order,
          selected: row.doc.selected,
        };
      })
      .sort((a: ITab, b: ITab) => a.order - b.order);
  }

  public static async upsert(tab: ITab, account: string): Promise<void> {
    const existingTab: ITab = await Persistence.find(tab.id, account);

    if (!existingTab) {
      await Persistence.insert(tab, account);

      return;
    }

    if (Persistence.hash(existingTab) !== Persistence.hash(tab)) {
      await Persistence.update(tab, account);

      return;
    }
  }

  protected static getDatabase(account: string): Promise<any> {
    if (Persistence.database) {
      return Persistence.database;
    }

    Persistence.database = new (window as any).PouchDB(`${Persistence.url}/offline-notepad`);

    return Persistence.database;
  }

  protected static async find(id: string, account: string): Promise<ITab> {
    try {
      const document: any = await (await Persistence.getDatabase(account)).get(id);

      if (!document) {
        return null;
      }

      return {
        content: document.content,
        deleted: document.deleted,
        editMode: document.editMode,
        id: document._id,
        lineNumbers: document.lineNumbers,
        name: document.name,
        order: document.order,
        selected: document.selected,
      };
    } catch {
      return null;
    }
  }

  protected static hash(tab: ITab): string {
    return JSON.stringify(tab);
  }

  protected static async insert(tab: ITab, account: string): Promise<ITab> {
    if (!tab.id) {
      tab.id = uuid.v4();
    }

    await (await Persistence.getDatabase(account)).put({
      account,
      content: tab.content,
      deleted: tab.deleted,
      editMode: tab.editMode,
      _id: tab.id,
      lineNumbers: tab.lineNumbers,
      name: tab.name,
      order: tab.order,
      selected: tab.selected,
    });

    return tab;
  }

  protected static async update(tab: ITab, account: string): Promise<ITab> {
    try {
      const document: any = await (await Persistence.getDatabase(account)).get(tab.id);

      if (!document) {
        return null;
      }

      await (await Persistence.getDatabase(account)).put({
        account,
        content: tab.content,
        deleted: tab.deleted,
        editMode: tab.editMode,
        _id: tab.id,
        lineNumbers: tab.lineNumbers,
        name: tab.name,
        order: tab.order,
        _rev: document._rev,
        selected: tab.selected,
      });

      return tab;
    } catch {
      return null;
    }
  }
}
