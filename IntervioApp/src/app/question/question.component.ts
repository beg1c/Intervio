import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent {
  @Input() questionInput: string;
  @Output() questionInputChange = new EventEmitter<string>();

  characterEntered() {
    this.questionInputChange.emit(this.questionInput);
  }
}
