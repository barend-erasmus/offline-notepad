import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgUtilsModule } from '@xyzblocks/ng-utils';
import { NgComponentsModule } from '@xyzblocks/ng-components';
import { AppComponent } from '@app/app.component';
import { AuthenticationService } from '@app/authentication';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, FormsModule, NgUtilsModule, NgComponentsModule],
  providers: [AuthenticationService],
  bootstrap: [AppComponent],
})
export class AppModule {}
