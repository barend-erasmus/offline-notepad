export class TextHelper {
  public static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (str) => {
      // tslint:disable-next-line:no-bitwise
      const randomNumber: number = (Math.random() * 16) | 0;

      // tslint:disable-next-line:no-bitwise
      const value: number = str === 'x' ? randomNumber : (randomNumber & 0x3) | 0x8;
      return value.toString(16);
    });
  }
}
