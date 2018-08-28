import { Component, OnInit } from '@angular/core';
import { BaseRepository } from './repositories/base';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public content: string = null;

  public selectedTabIndex: number = null;

  public tabs: string[] = null;

  protected timer: any = null;

  constructor(protected repository: BaseRepository) {
    this.repository.onChanges(async () => {
      this.tabs = await this.repository.listTabNames();

      await this.updateTabContent();
    });
  }

  public async ngOnInit(): Promise<void> {
    this.tabs = await this.repository.listTabNames();

    if (this.tabs.length === 0) {
      await this.addNewTab(
        [
          'Welcome to Offline Notepad ++',
          '',
          'Contributors',
          '    Barend Erasmus',
          '    Stuart Green',
          '',
          'Visit us on GitHub (https://github.com/barend-erasmus/offline-notepad)',
        ].join('\r\n'),
      );

      this.tabs = await this.repository.listTabNames();

      this.selectedTabIndex = 0;
    } else {
      this.selectedTabIndex = 0;
    }

    await this.updateTabContent();

    (window as any).gtag('event', 'open', {
      selectedTabIndex: this.selectedTabIndex,
      tabs: this.tabs,
    });
  }

  public async onChangeContent(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(async () => {
      this.timer = null;

      await this.repository.updateTab(this.tabs[this.selectedTabIndex], this.content);
    }, 2000);
  }

  public async onClickCloseTab(index: number): Promise<void> {
    if (this.tabs.length === 1) {
      return;
    }

    await this.repository.deleteTab(this.tabs[index]);

    this.tabs = await this.repository.listTabNames();

    this.selectedTabIndex = 0;

    await this.updateTabContent();

    (window as any).gtag('event', 'tab_close', {
      index,
    });
  }

  public async onClickNewTab(): Promise<void> {
    await this.addNewTab(null);

    this.tabs = await this.repository.listTabNames();

    this.selectedTabIndex = this.tabs.length - 1;

    await this.updateTabContent();

    (window as any).gtag('event', 'tab_open');
  }

  public async onClickTab(index: number): Promise<void> {
    this.selectedTabIndex = index;

    await this.updateTabContent();

    (window as any).gtag('event', 'tab_open');
  }

  protected async addNewTab(content: string): Promise<void> {
    let index = 1;

    let name = `new ${index}`;

    while (this.tabs.indexOf(name) > -1) {
      index++;

      name = `new ${index}`;
    }

    await this.repository.insertTab(name, content);

    (window as any).gtag('event', 'tab_new');
  }

  protected async updateTabContent(): Promise<void> {
    const name: string = this.tabs[this.selectedTabIndex];

    this.content = await this.repository.getTabContent(name);
  }
}
