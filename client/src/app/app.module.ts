import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { DataModel } from './model/data.model';
import { Repository } from './model/repository.model';
import { Mainlib } from './model/mainlib.model';
import { RegistrationComponent } from './registration/registration.component';
import { HeadComponent } from './head/head.component';
import { NewPostComponent } from './new-post/new-post.component';
import { TapeComponent } from './tape/tape.component';
import { RnBackgroundDirective } from './rn-background.directive';
import { InteractionService } from './interaction.service';



@NgModule({
  declarations: [
    AppComponent,
    RegistrationComponent,
    HeadComponent,
    NewPostComponent,
    TapeComponent,
    RnBackgroundDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
  	DataModel,
  	Repository,
  	Mainlib,
  	InteractionService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
