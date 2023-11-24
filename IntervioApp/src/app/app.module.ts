import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatGridListModule } from '@angular/material/grid-list';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VideoComponent } from './video/video.component';
import { QuestionComponent } from './question/question.component';
import { EditorComponent } from './editor/editor.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WelcomeComponent } from './welcome/welcome.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InterviewComponent } from './interview/interview.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ConsoleComponent } from './console/console.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { VideoRemoteComponent } from './video-remote/video-remote.component';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { ToastrModule, ToastContainerDirective } from 'ngx-toastr';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';

@NgModule({
  declarations: [
    AppComponent,
    VideoComponent,
    QuestionComponent,
    EditorComponent,
    WelcomeComponent,
    InterviewComponent,
    ConsoleComponent,
    VideoRemoteComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatGridListModule,
    FontAwesomeModule,
    BsDropdownModule,
    CodemirrorModule,
    ToastrModule.forRoot(),
    ToastContainerDirective,
    ModalModule.forRoot(),
    ProgressbarModule.forRoot(),
    NgxSpinnerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
