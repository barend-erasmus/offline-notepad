import { Injectable } from '@angular/core';

@Injectable()
export class AuthenticationService {
  public async getUser(): Promise<string> {
    return null;
  }

  public async signIn(): Promise<string> {
    return 'foo@bar.com';
  }

  public async signOut(): Promise<string> {
    return null;
  }
}
