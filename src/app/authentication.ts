import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable()
export class AuthenticationService {
  protected initialized = false;

  constructor() {
    (window as any).gapi.load('client:auth2', () => {
      (window as any).gapi.client
        .init({
          clientId: environment.googleOAuth2ClientId,
          scope: 'profile',
        })
        .then(() => {
          this.initialized = true;
        });
    });
  }

  public async getUser(): Promise<string> {
    while (!this.initialized) {
      await this.delay(200);
    }

    return new Promise((resolve: (result: string) => void, reject: (error: Error) => void) => {
      const isSignedIn: boolean = (window as any).gapi.auth2.getAuthInstance().isSignedIn.get();

      if (!isSignedIn) {
        resolve(null);
      }

      const userInfo: any = (window as any).gapi.auth2
        .getAuthInstance()
        .currentUser.get()
        .getBasicProfile();

      resolve(userInfo.getEmail());
    });
  }

  public signIn(): Promise<string> {
    return new Promise((resolve: (result: string) => void, reject: (error: Error) => void) => {
      (window as any).gapi.auth2.getAuthInstance().isSignedIn.listen(async (listenResult: boolean) => {
        if (listenResult) {
          const userInfo: any = (window as any).gapi.auth2
            .getAuthInstance()
            .currentUser.get()
            .getBasicProfile();

          resolve(userInfo.getEmail());
        } else {
          resolve(null);
        }
      });

      (window as any).gapi.auth2.getAuthInstance().signIn();
    });
  }

  public signOut(): Promise<string> {
    return new Promise((resolve: (result: string) => void, reject: (error: Error) => void) => {
      (window as any).gapi.auth2.getAuthInstance().signOut();

      setTimeout(async () => {
        const user: string = await this.getUser();
        resolve(user);
      }, 500);
    });
  }

  protected delay(miliseconds: number): Promise<void> {
    return new Promise((resolve: () => void, reject: (error: Error) => void) => {
      setTimeout(resolve, miliseconds);
    });
  }
}
