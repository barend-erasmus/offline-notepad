import { Component, OnInit, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { BaseRepository } from './repositories/base';
import { environment } from '../environments/environment';
import { Tab } from './models/tab';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public selectedTab: Tab = null;

  public isInEditMode = false;

  public tabs: Array<Tab> = null;

  protected timer: any = null;

  public user: string = null;

  @ViewChildren('tabInput')
  public tabInputs: QueryList<ElementRef> = null;

  constructor(protected repository: BaseRepository) {
    this.repository.onChanges(async () => {
      await this.refresh();
    });

    this.initializeGoogleOAuth2();
  }

  public async ngOnInit(): Promise<void> {
    await this.refresh();

    (window as any).gtag('event', 'open');
  }

  public async onChangeContent(tab: Tab): Promise<void> {
    // TODO: Clone

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(async () => {
      this.timer = null;

      await this.repository.update(tab);
    }, 1200);
  }

  public async onClickCloseTab(tab: Tab): Promise<void> {
    if (this.tabs.length === 1) {
      return;
    }

    await this.repository.delete(tab);

    await this.refresh();

    (window as any).gtag('event', 'tab_close');
  }

  public async onClickNewTab(): Promise<void> {
    await this.addNewTab(null);

    await this.refresh();

    (window as any).gtag('event', 'tab_open');
  }

  public onClickSignIn(): void {
    (window as any).gapi.auth2.getAuthInstance().signIn();
  }

  public onClickSignOut(): void {
    (window as any).gapi.auth2.getAuthInstance().signOut();

    this.user = null;
  }

  public async onBlurTab(tab: Tab): Promise<void> {
    this.isInEditMode = false;

    await this.repository.update(tab);

    await this.refresh();
  }

  public async onClickTab(tab: Tab): Promise<void> {
    this.selectedTab = tab;

    await this.refresh();

    (window as any).gtag('event', 'tab_open');
  }

  public onDoubleClickTab(): void {
    this.isInEditMode = true;

    // TODO: Refactor
    setTimeout(() => {
      this.tabInputs.toArray()[0].nativeElement.focus();
    }, 200);
  }

  protected async addNewTab(content: string): Promise<void> {
    let index = 1;

    let name = `new ${index}`;

    while (this.tabs.find((tab: Tab) => tab.name === name)) {
      index++;

      name = `new ${index}`;
    }

    await this.repository.insert(new Tab(null, name, content));

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
    this.tabs = await this.repository.list();

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

      this.tabs = await this.repository.list();
    }

    if (this.selectedTab) {
      this.selectedTab = this.tabs.find((tab: Tab) => tab.id === this.selectedTab.id);
    }

    if (!this.selectedTab) {
      this.selectedTab = this.tabs[0];
    }
  }
}
