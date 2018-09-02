import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, FormsModule],
  providers: [
    // { provide: BaseRepository, useClass: IndexedDBRepository },
    // { provide: BaseRepository, useClass: PouchDBRepository },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
