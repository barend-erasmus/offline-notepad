import { Component, OnInit, ElementRef } from '@angular/core';
import { ContextMenuState } from '@app/context-menu-state';
import { ApplicationState } from '@app/application-state';
import { Persistence } from '@app/persistence';
import * as uuid from 'uuid';
import { AuthenticationService } from '@app/authentication';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  protected account: string = null;

  public applicationState: ApplicationState = null;

  public contextMenuState: ContextMenuState = null;

  public user: string = null;

  constructor(protected authenticationService: AuthenticationService, protected elementRef: ElementRef) {
    this.account = localStorage.getItem('default-account-id');

    if (!this.account) {
      this.account = uuid.v4();

      localStorage.setItem('default-account-id', this.account);
    }

    this.applicationState = ApplicationState.create();

    this.contextMenuState = ContextMenuState.create(this.applicationState);

    setInterval(() => {
      this.sync();
    }, 10000);
  }

  public async ngOnInit(): Promise<void> {
    this.user = await this.authenticationService.getUser();

    this.applicationState.setTabs(await Persistence.findAllTabs(`${this.user ? this.user : this.account}`));
  }

  public async onClickSignIn(): Promise<void> {
    this.user = await this.authenticationService.signIn();

    this.applicationState.setTabs(await Persistence.findAllTabs(`${this.user ? this.user : this.account}`));

    (window as any).gtag('event', 'sign_in');
  }

  public async onClickSignOut(): Promise<void> {
    this.user = await this.authenticationService.signOut();

    this.applicationState.setTabs(await Persistence.findAllTabs(`${this.user ? this.user : this.account}`));

    (window as any).gtag('event', 'sign_out');
  }

  public onKeydown(event: KeyboardEvent): void {
    event.preventDefault();

    const textAreaElement: HTMLTextAreaElement = this.elementRef.nativeElement.querySelector('textarea');

    const text: string = textAreaElement.value;
    const start: number = textAreaElement.selectionStart;
    const end: number = textAreaElement.selectionEnd;

    const tabbedText = `${text.substring(0, start)}\t${text.substring(end)}`;

    textAreaElement.value = tabbedText;

    textAreaElement.selectionStart = start + 1;
    textAreaElement.selectionEnd = start + 1;
  }

  public onScrollContent(): void {
    const textAreaElement = this.elementRef.nativeElement.querySelector('textarea');

    const textScrollHeight: number = textAreaElement.scrollTop;

    textAreaElement.querySelector('div').scrollTo({ top: textScrollHeight });
  }

  protected async sync(): Promise<void> {
    for (const tab of this.applicationState.tabs) {
      await Persistence.upsert(tab, `${this.user ? this.user : this.account}`);
    }

    (window as any).gtag('event', 'synced');
  }
}
