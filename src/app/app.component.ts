import { Component, OnInit } from '@angular/core';
import { BaseRepository } from './repositories/base';
import { environment } from '../environments/environment';

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

  public user: string = null;

  constructor(protected repository: BaseRepository) {
    this.repository.onChanges(async () => {
      await this.refresh();
    });

    this.selectedTabIndex = 0;

    this.initializeGoogleOAuth2();
  }

  public async ngOnInit(): Promise<void> {
    await this.refresh();

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
    }, 1200);
  }

  public async onClickCloseTab(index: number): Promise<void> {
    if (this.tabs.length === 1) {
      return;
    }

    await this.repository.deleteTab(this.tabs[index]);

    this.tabs = await this.repository.listTabNames();

    this.selectedTabIndex = 0;

    await this.refresh();

    (window as any).gtag('event', 'tab_close', {
      index,
    });
  }

  public async onClickNewTab(): Promise<void> {
    await this.addNewTab(null);

    this.tabs = await this.repository.listTabNames();

    this.selectedTabIndex = this.tabs.length - 1;

    await this.refresh();

    (window as any).gtag('event', 'tab_open');
  }

  public onClickSignIn(): void {
    (window as any).gapi.auth2.getAuthInstance().signIn();
  }

  public onClickSignOut(): void {
    (window as any).gapi.auth2.getAuthInstance().signOut();
  }

  public async onClickTab(index: number): Promise<void> {
    this.selectedTabIndex = index;

    await this.refresh();

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

  protected initializeGoogleOAuth2(): void {
    (window as any).gapi.load('client:auth2', () => {
      (window as any).gapi.client
        .init({
          clientId: environment.googleOAuth2ClientId,
          scope: 'profile',
        })
        .then(async () => {
          (window as any).gapi.auth2.getAuthInstance().isSignedIn.listen(async (value) => {
            const userInfo: any = (window as any).gapi.auth2
              .getAuthInstance()
              .currentUser.get()
              .getBasicProfile();

            this.user = userInfo.getEmail();

            this.repository.setAccount(`${userInfo.getId()}-${this.user}`);

            this.refresh();
          });

          if ((window as any).gapi.auth2.getAuthInstance().isSignedIn.get()) {
            const userInfo: any = (window as any).gapi.auth2
              .getAuthInstance()
              .currentUser.get()
              .getBasicProfile();

            this.user = userInfo.getEmail();

            this.repository.setAccount(`${userInfo.getId()}-${this.user}`);

            this.refresh();
          }
        });
    });
  }

  protected async refresh(): Promise<void> {
    // Refresh Tabs
    this.tabs = await this.repository.listTabNames();

    if (this.tabs.length === 0) {
      await this.addNewTab(
        [
          'Welcome to Offline Notepad',
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
    }

    // Refresh Current Content
    const name: string = this.tabs[this.selectedTabIndex];

    this.content = await this.repository.getTabContent(name);
  }
}
