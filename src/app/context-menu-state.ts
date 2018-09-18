import { ContextMenuItem } from '@xyzblocks/ng-utils';

export class ContextMenuState {
  public static items: Array<ContextMenuItem> = [
    {
      text: 'Download',
    },
    {
      text: 'Close',
    },
  ];

  public static visible: boolean = null;

  public static x: number = null;

  public static y: number = null;
}
