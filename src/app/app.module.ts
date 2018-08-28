import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { BaseRepository } from './repositories/base';
import { IndexedDBRepository } from './repositories/indexed-db-repository';
import { PouchDBRepository } from './repositories/pouch-db-repository';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, FormsModule],
  providers: [{ provide: BaseRepository, useClass: PouchDBRepository }],
  bootstrap: [AppComponent],
})
export class AppModule {}
