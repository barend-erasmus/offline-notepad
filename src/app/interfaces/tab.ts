export interface ITab {
  content: string;

  deleted: boolean;

  editMode: boolean;

  id: string;

  lineNumbers: Array<number>;

  name: string;

  order: number;

  selected: boolean;
}
