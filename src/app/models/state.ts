import { Tab } from './tab';

export class State {
  constructor(public tabs: Array<Tab>, public selectedTab: Tab) {
    this.filter();
    this.sort();
  }

  public filter(): void {
    this.tabs = this.tabs.filter((tab: Tab) => !tab.deleted);
  }

  public pushTab(tab: Tab): void {
    this.tabs.push(tab);

    this.filter();
    this.sort();
  }

  public sort(): void {
    this.tabs = this.tabs.sort((a: Tab, b: Tab) => a.order - b.order);
  }
}
