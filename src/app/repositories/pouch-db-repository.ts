import { Injectable } from '@angular/core';
import { BaseRepository } from './base';

@Injectable()
export class PouchDBRepository extends BaseRepository {
  protected database = null;

  constructor() {
    super();

    this.database = new (window as any).PouchDB('offline-notepad');
  }

  public async deleteTab(name: string): Promise<void> {
    throw new Error();
  }

  public async getTabContent(name: string): Promise<string> {
    return null;
  }

  public async insertTab(name: string, content: string): Promise<void> {
    throw new Error();
  }

  public async listTabNames(): Promise<Array<string>> {
    return ['hello'];
  }

  public async updateTab(name: string, content: string): Promise<void> {
    throw new Error();
  }
}
