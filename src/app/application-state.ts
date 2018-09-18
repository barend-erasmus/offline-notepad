import { ITab } from '@app/interfaces/tab';

export class ApplicationState {
  public static tabs: Array<ITab> = [];

  public static selectTab(tab: ITab): void {}
}
