import { IRepository } from './interfaces/repository';
import { Tab } from './models/tab';
import { State } from './models/state';
import { Injectable } from '@angular/core';

@Injectable()
export class Service {
  constructor(protected repository: IRepository) {}

  public async newTab(content: string, state: State): Promise<State> {
    const name: string = this.getNewTabName(state.tabs);

    const tab: Tab = await this.repository.upsert(
      new Tab(null, name, content, this.getMaximumOrder(state.tabs) + 1, false),
    );

    state.pushTab(tab);

    state.selectedTab = tab;

    return state;
  }

  public async getState(): Promise<State> {
    const tabs: Array<Tab> = await this.repository.list();

    const state: State = new State(tabs, null);

    if (tabs.length === 0) {
      return this.newTab(
        [
          'Welcome to Offline Notepad',
          '',
          'Contributors',
          '    Barend Erasmus',
          '    Stuart Green',
          '',
          'Visit us on GitHub (https://github.com/barend-erasmus/offline-notepad)',
        ].join('\r\n'),
        state,
      );
    }

    return state;
  }

  public async upsert(tab: Tab, state: State): Promise<State> {
    const upsertedTab: Tab = await this.repository.upsert(tab);

    state.pushTab(upsertedTab);

    state.selectedTab = upsertedTab;

    return state;
  }

  protected getMaximumOrder(tabs: Array<Tab>): number {
    const maximumOrder: number = Math.max(...tabs.map((tab: Tab) => tab.order));

    if (!maximumOrder || isNaN(maximumOrder) || Math.abs(maximumOrder) === Infinity) {
      return 0;
    }

    return maximumOrder;
  }

  protected getNewTabName(tabs: Array<Tab>): string {
    let index = 1;

    let name = `new ${index}`;

    while (tabs.find((tab: Tab) => tab.name === name)) {
      index++;

      name = `new ${index}`;
    }

    return name;
  }
}
