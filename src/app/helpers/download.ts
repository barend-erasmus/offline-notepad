export class DownloadHelper {
  public static download(base64String: string, filename: string): void {
    const element: HTMLAnchorElement = document.createElement('a');

    element.setAttribute('href', base64String);
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }
}
