import { Component, OnInit, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { Tab } from './models/tab';
import { TextHelper } from './helpers/text';
import { AuthenticationService } from './authentication';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public selectedTab: Tab = null;

  public isInEditMode = false;

  public tabs: Array<Tab> = null;

  public lineNumbers: number[];

  protected timer: any = null;

  public user: string = null;

  @ViewChildren('tabInput')
  public tabInputs: QueryList<ElementRef> = null;

  constructor(protected authenticationService: AuthenticationService) {
    Tab.eventEmitter.subscribe(async () => {
      await this.loadTabs();
    });
  }

  public async ngOnInit(): Promise<void> {
    this.user = await this.authenticationService.getUser();

    await this.loadTabs();

    await this.loadLineNumbers();
  }

  public async onChangeContent(tab: Tab): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    await this.loadLineNumbers();

    this.timer = setTimeout(async () => {
      this.timer = null;

      const account: string = this.getAccount();
      await tab.save(account);

      (window as any).gtag('event', 'tab_edit');
    }, 300);
  }

  public async onClickCloseTab(tab: Tab): Promise<void> {
    const account: string = this.getAccount();
    await tab.delete(account);

    await this.loadTabs();

    (window as any).gtag('event', 'tab_close');
  }

  public async onClickNewTab(): Promise<void> {
    const tab: Tab = await Tab.create(this.getMaximumOrder() + 1);
    this.tabs.push(tab);

    (window as any).gtag('event', 'tab_add');
  }

  public async onClickSignIn(): Promise<void> {
    this.user = await this.authenticationService.signIn();

    await this.loadTabs();

    (window as any).gtag('event', 'sign_in');
  }

  public async onClickSignOut(): Promise<void> {
    this.user = await this.authenticationService.signOut();

    await this.loadTabs();

    (window as any).gtag('event', 'sign_out');
  }

  public async onBlurTab(tab: Tab): Promise<void> {
    this.isInEditMode = false;

    const account: string = this.getAccount();
    await tab.save(account);
  }

  public async onClickTab(tab: Tab): Promise<void> {
    this.selectedTab = tab;
    await this.loadLineNumbers();
    (window as any).gtag('event', 'tab_focus');
  }

  public onDoubleClickTab(): void {
    this.isInEditMode = true;

    setTimeout(() => {
      this.tabInputs.toArray()[0].nativeElement.focus();
    }, 200);

    (window as any).gtag('event', 'tab_rename');
  }

  public onDragOverTab(event: DragEvent, tab: Tab): void {
    event.preventDefault();
  }

  public onDragStartTab(event: any, tab: Tab): void {
    event.dataTransfer.setData('tab-id', tab.id);
  }

  public onScroll(): void {
    const textScrollHeight = document.getElementById('textArea').scrollTop;
    document.getElementById('lineNumbers').scrollTo({top: textScrollHeight});
  }

  public async onDropTab(event: DragEvent, tab: Tab): Promise<void> {
    const draggedTabId: string = event.dataTransfer.getData('tab-id');
    const draggedTab: Tab = this.tabs.find((x: Tab) => x.id === draggedTabId);
    const draggedTabOrder: number = draggedTab.order;

    draggedTab.order = tab.order;
    tab.order = draggedTabOrder;

    const account: string = this.getAccount();

    await draggedTab.save(account);
    await tab.save(account);

    this.tabs = this.tabs.sort((a: Tab, b: Tab) => b.order - a.order);

    (window as any).gtag('event', 'tab_reorder');
  }

  protected getMaximumOrder(): number {
    const maximumOrder: number = Math.max(...this.tabs.map((tab: Tab) => tab.order));

    if (!maximumOrder || isNaN(maximumOrder) || Math.abs(maximumOrder) === Infinity) {
      return 0;
    }

    return maximumOrder;
  }

  protected getAccount(): string {
    if (this.user) {
      return `${this.user}`;
    }

    let account: string = localStorage.getItem('account');

    if (!account) {
      account = TextHelper.generateUUID();

      localStorage.setItem('account', account);
    }

    return account;
  }

  protected async loadTabs(): Promise<void> {
    const account: string = this.getAccount();

    this.tabs = await Tab.loadAll(account);

    if (this.tabs.length === 0) {
      const tab: Tab = await Tab.create(this.getMaximumOrder() + 1);
      this.tabs.push(tab);
    }

    if (this.selectedTab && this.tabs.indexOf(this.selectedTab) === -1) {
      this.selectedTab = this.tabs.find((tab: Tab) => tab.id === this.selectedTab.id);
    }

    if (!this.selectedTab) {
      this.selectedTab = this.tabs[0];
    }

    console.log(this.tabs);
  }

  protected async loadLineNumbers(): Promise<void> {

    if(!this.selectedTab.content){
      this.lineNumbers = [1];
      return;
    }
    const lines = this.selectedTab.content.split('\n')
    let lineArr:number[] = []
    for(let i = 1 ; i <= lines.length ; i++){
      lineArr.push(i);
    }
    this.lineNumbers = lineArr;
  }
}
