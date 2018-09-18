import { ContextMenuItem } from '@xyzblocks/ng-utils';
import { ITab } from '@app/interfaces/tab';
import { ApplicationState } from '@app/application-state';
import { DownloadHelper } from '@app/helpers/download';

export class ContextMenuState {
  protected applicationState: ApplicationState = null;

  public items: Array<ContextMenuItem> = [
    {
      text: 'Download',
    },
    {
      text: 'Close',
    },
  ];

  public visible: boolean = null;

  public x: number = null;

  public y: number = null;

  public static create(applicationState: ApplicationState): ContextMenuState {
    const contextMenuState: ContextMenuState = new ContextMenuState();

    contextMenuState.applicationState = applicationState;

    contextMenuState.visible = false;

    return contextMenuState;
  }

  public hide(): boolean {
    this.visible = false;

    (window as any).gtag('event', 'context_menu_hidden');

    return false;
  }

  public select(item: ContextMenuItem, tab: ITab): void {
    this.visible = false;

    switch (item.text) {
      case 'Close':
        this.applicationState.closeTab(tab.content);

        (window as any).gtag('event', 'tab_closed');
        break;
      case 'Download':
        const content: string = tab.content.replace(new RegExp('([^\r]\n)', 'g'), '\r\n');
        const encodedContent: string = encodeURIComponent(content);

        DownloadHelper.download(`data:text/plain;charset=utf-8,${encodedContent}`, `${tab.name}.txt`);

        (window as any).gtag('event', 'tab_downloaded');
        break;
    }
  }

  public show(event: MouseEvent): boolean {
    this.x = event.x;
    this.y = event.y;

    this.visible = true;

    (window as any).gtag('event', 'context_menu_shown');

    return false;
  }
}
