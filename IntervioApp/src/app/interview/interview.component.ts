import { ChangeDetectorRef, Component, HostListener, TemplateRef } from '@angular/core';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { faPhone, faPlay, faTerminal } from '@fortawesome/free-solid-svg-icons';
import { DataService } from '../_services/data.service';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Room } from '../_models/room';

@Component({
  selector: 'app-interview',
  templateUrl: './interview.component.html',
  styleUrls: ['./interview.component.css']
})

export class InterviewComponent{
  isSmallScreen: boolean = false;
  selectedItem: string = 'question';
  showLocal: boolean = true;

  faPhone = faPhone;
  faPlay = faPlay;
  faTerminal = faTerminal;

  modalRef?: BsModalRef;
  time: Date = new Date();
  interval1: any;

  room: Room;
  languageLink: string;
  languageName: string;
  editorMode: string;
  activeLanguageId: number;

  dataServiceSubscription: Subscription;
  connectedSubscription: Subscription;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.checkScreenSize();
  }

  constructor (private dataService: DataService, private location: Location, private changeDetectorRef: ChangeDetectorRef, private modalService: BsModalService, private router: Router, private toastr: ToastrService) {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    this.room = this.dataService.loadedRoom;
    this.setLanguage();
    this.activeLanguageId = this.room.language_id;
    this.location.replaceState(this.room.name);

    this.addClock();
    this.trackRoomChanges();

  }

  ngOnDestroy(): void {
    this.dataServiceSubscription.unsubscribe();
    this.connectedSubscription.unsubscribe();
  }

  private trackRoomChanges(): void {
    this.dataServiceSubscription = this.dataService.room$.subscribe(room => {
      this.room = room;

      if (this.room.language_id != this.activeLanguageId) {
        this.setLanguage();
        this.setEditor();
        this.activeLanguageId = this.room.language_id;
        this.toastr.success("Programming language changed.", "", {
          positionClass: "toast-bottom-right",
        });
      }

      this.changeDetectorRef.detectChanges();
    });
  }

  private addClock(): void {
    this.interval1 = setInterval(() => {
      this.time = new Date();
    }, 1000);
  }

  questionChangeHandler(question: string) {
    this.room.question = question;
    this.dataService.sendRoomData(this.room)
  }

  editorChangeHandler(editor: string) {
    this.room.editor = editor;
    this.dataService.sendRoomData(this.room)
  }

  sendRunMessage() {
    this.dataService.sendRunData({
      source_code: this.room.editor,
      language_id: this.room.language_id,
      wait: "true",
      stdin: null
    })
  }

  changeLanguage(language: number) {
    this.room.language_id = language;
    this.dataService.sendRoomData(this.room);

    if (this.room.language_id != this.activeLanguageId) {
      this.activeLanguageId = this.room.language_id;
      this.setLanguage();
      this.setEditor();
      this.toastr.success("Programming language changed.", "", {
        positionClass: "toast-bottom-right",
      });
    }
  }

  leaveInterview() {
    this.router.navigate(['/']);
    this.location.replaceState('');
    window.location.reload();
  }

  private setEditor() {
    switch (this.room.language_id) {
      case 50:
        this.room.editor = "#include <stdio.h>\n  \nint main() {\n   printf(\"Hello World!\");\n   return 0;\n}";
        break;
      case 54:
        this.room.editor = "#include <iostream>\n\nint main() {\n    std::cout << \"Hello World!\";\n    return 0;\n}";
        break;
      case 51:
        this.room.editor = "namespace HelloWorld\n{\n    class Hello {         \n        static void Main(string[] args)\n        {\n            System.Console.WriteLine(\"Hello World!\");\n        }\n    }\n}";
        break;
      case 62:
        this.room.editor = "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello World!\");\n    }\n}\n";
        break;
      case 63:
        this.room.editor = "console.log('Hello World!');";
        break;
      case 78:
        this.room.editor = "fun main(args : Array<String>) {\n    println(\"Hello, World!\")\n}";
        break;
      case 85:
        this.room.editor = "print('Hello World');";
        break;
      case 68:
        this.room.editor = "<?php \necho 'Hello World!'; \n?>";
        break;
      case 71:
        this.room.editor = "print('Hello World!')";
        break;
      case 72:
        this.room.editor = "puts 'Hello World!'";
        break;
      case 82:
        this.room.editor = "CREATE TABLE helloworld (phrase TEXT);\n\tINSERT INTO helloworld VALUES (\"Hello World!\");\nSELECT * FROM helloworld;";
        break;
      case 74:
        this.room.editor = "let message: string = 'Hello, World!';\nconsole.log(message);";
        break;
    }
  }

  private setLanguage() {
    switch (this.room.language_id) {
      case 50:
        this.languageLink = "/assets/language-icons/c.svg";
        this.languageName = "C";
        this.editorMode = "clike";
        break;
      case 54:
        this.languageLink = "/assets/language-icons/c++.svg";
        this.languageName = "C++";
        this.editorMode = "clike";
        break;
      case 51:
        this.languageLink = "/assets/language-icons/csharp.svg";
        this.languageName = "C#";
        this.editorMode = "clike";
        break;
      case 62:
        this.languageLink = "/assets/language-icons/java.svg";
        this.languageName = "Java";
        this.editorMode = "clike";
        break;
      case 63:
        this.languageLink = "/assets/language-icons/javascript.svg";
        this.languageName = "JavaScript";
        this.editorMode = "javascript";
        break;
      case 78:
        this.languageLink = "/assets/language-icons/kotlin.svg";
        this.languageName = "Kotlin";
        this.editorMode = "clike";
        break;
      case 85:
        this.languageLink = "/assets/language-icons/perl.svg";
        this.languageName = "Perl";
        this.editorMode = "perl";
        break;
      case 68:
        this.languageLink = "/assets/language-icons/php.svg";
        this.languageName = "PHP";
        this.editorMode = "php";
        break;
      case 71:
        this.languageLink = "/assets/language-icons/python.svg";
        this.languageName = "Python";
        this.editorMode = "python";
        break;
      case 72:
        this.languageLink = "/assets/language-icons/ruby.svg";
        this.languageName = "Ruby";
        this.editorMode = "ruby";
        break;
      case 82:
        this.languageLink = "/assets/language-icons/sql.svg";
        this.languageName = "SQL";
        this.editorMode = "sql";
        break;
      case 74:
        this.languageLink = "/assets/language-icons/typescript.svg";
        this.languageName = "TypeScript";
        this.editorMode = "javascript";
        break;
    }
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-dialog-centered modal-sm'});
  }

  confirm(): void {
    this.modalRef?.hide();
  }

  decline(): void {
    this.modalRef?.hide();
  }

  toggleVideo() {
    this.showLocal = !this.showLocal;
  }

  private checkScreenSize() {
    this.isSmallScreen = window.innerWidth < 576;
  }
}
