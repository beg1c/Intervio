import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})

export class EditorComponent{
  @Input() editorInput: string;
  @Input() editorMode: string; 
  @Output() editorInputChange = new EventEmitter<string>();

  currentMode: string | null = null;

  codeMirrorOptions = {
    styleActiveLine: { nonEmpty: true}, 
    lineWrapping: true, 
    lineNumbers: true, 
    theme: 'ayu-mirage', 
    mode: this.currentMode,
  }

  ngOnInit() {
    this.currentMode = this.editorMode;
  }
  
  ngOnChanges() {
    if (this.currentMode != this.editorMode) {
      this.currentMode = this.editorMode;
      this.codeMirrorOptions.mode = this.currentMode;
    }
  }

  characterEntered() {
    this.editorInputChange.emit(this.editorInput);
  }
}

