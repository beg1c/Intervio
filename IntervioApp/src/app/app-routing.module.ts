import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WelcomeComponent } from './welcome/welcome.component';
import { InterviewComponent } from './interview/interview.component';

const routes: Routes = [
  { path: "", component: WelcomeComponent},
  { path: "interview", component: InterviewComponent},
  { path: '**', component: WelcomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
