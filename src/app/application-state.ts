import * as uuid from 'uuid';
import { ITab } from '@app/interfaces/tab';

export class ApplicationState {
  public showDeletedTabs = false;

  public tabs: Array<ITab> = [];

  public static create(): ApplicationState {
    const applicationState: ApplicationState = new ApplicationState();

    applicationState.tabs = [];

    return applicationState;
  }

  // public reorderTabs(tabId1: string, tabId2: string): void {
  //   const tab1: ITab = this.tabs.find((tab: ITab) => tab.id === tabId1);
  //   const tab2: ITab = this.tabs.find((tab: ITab) => tab.id === tabId2);

  //   const order1: number = tab1.order;
  //   const order2: number = tab2.order;

  //   tab1.order = order2;
  //   tab2.order = order1;

  //   this.tabs = this.tabs.sort((a: ITab, b: ITab) => b.order - a.order);
  // }

  public closeTab(tabId: string): void {
    if (!this.tabs) {
      return;
    }

    const tab: ITab = this.tabs.find((x: ITab) => x.id === tabId);

    if (!tab) {
      return;
    }

    tab.deleted = true;

    this.autoSelectTabs();

    (window as any).gtag('event', 'tab_closed');
  }

  public editTab(tabId: string): void {
    if (!this.tabs) {
      return;
    }

    const tab: ITab = this.tabs.find((x: ITab) => x.id === tabId);

    if (!tab) {
      return;
    }

    tab.editMode = true;

    (window as any).gtag('event', 'tab_edit');
  }

  public editTabComplete(tabId: string): void {
    if (!this.tabs) {
      return;
    }

    const tab: ITab = this.tabs.find((x: ITab) => x.id === tabId);

    if (!tab) {
      return;
    }

    tab.editMode = false;

    (window as any).gtag('event', 'tab_edit_complete');
  }

  public newTab(): void {
    if (!this.tabs) {
      return;
    }

    const tab: ITab = {
      content: null,
      deleted: false,
      editMode: false,
      id: uuid.v4(),
      lineNumbers: [1],
      name: 'new',
      order: this.getMaximumTabOrder() + 1,
      selected: false,
    };

    this.tabs.push(tab);

    this.selectTab(tab.id);

    (window as any).gtag('event', 'tab_new');
  }

  public selectTab(tabId: string): void {
    if (!this.tabs) {
      return;
    }

    for (const tab of this.tabs) {
      if (tab.id === tabId) {
        tab.selected = true;

        continue;
      }

      tab.selected = false;
    }

    (window as any).gtag('event', 'tab_selected');
  }

  public setTabs(tabs: Array<ITab>): void {
    if (!tabs) {
      return;
    }

    this.tabs = tabs;

    const notDeletedTabs: Array<ITab> = this.getNotDeletedTabs();

    if (!notDeletedTabs) {
      return;
    }

    if (notDeletedTabs.length === 0) {
      this.newTab();

      return;
    }

    this.autoSelectTabs();

    (window as any).gtag('event', 'tabs_set');
  }

  public refreshLineNumbers(tabId: string): void {
    if (!this.tabs) {
      return;
    }

    const tab: ITab = this.tabs.find((x: ITab) => x.id === tabId);

    if (!tab) {
      return;
    }

    tab.lineNumbers = tab.content.split('\n').map((line: string, index: number) => index + 1);
  }

  protected autoSelectTabs(): void {
    const notDeletedTabs: Array<ITab> = this.getNotDeletedTabs();

    if (!notDeletedTabs) {
      return;
    }

    const selectedCount: number = notDeletedTabs.filter((tab: ITab) => tab.selected).length;

    if (selectedCount !== 1) {
      if (notDeletedTabs.length === 0) {
        return;
      }

      this.selectTab(notDeletedTabs[0].id);
    }
  }

  protected getMaximumTabOrder(): number {
    const notDeletedTabs: Array<ITab> = this.getNotDeletedTabs();

    if (!notDeletedTabs) {
      return;
    }

    const maximumOrder: number = Math.max(...notDeletedTabs.map((tab: ITab) => tab.order));

    if (!maximumOrder || isNaN(maximumOrder) || Math.abs(maximumOrder) === Infinity) {
      return 0;
    }

    return maximumOrder;
  }

  protected getNotDeletedTabs(): Array<ITab> {
    if (!this.tabs) {
      return null;
    }

    return this.tabs.filter((tab: ITab) => !tab.deleted);
  }
}
