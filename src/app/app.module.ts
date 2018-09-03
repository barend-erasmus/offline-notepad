import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AuthenticationService } from './authentication';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, FormsModule],
  providers: [
    // { provide: BaseRepository, useClass: IndexedDBRepository },
    // { provide: BaseRepository, useClass: PouchDBRepository },
    AuthenticationService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
