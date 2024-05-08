import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../_services/data.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common'; 
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})

export class WelcomeComponent { 
  @ViewChild("join", {static: true}) join: TemplateRef<any>;
  get roomName() { return this.roomForm.get('roomName'); }
  get name() { return this.userForm.get('name'); }
  roomForm: FormGroup;
  userForm: FormGroup;
  submitAttemptJoin: boolean;
  submitAttemptNameCreate: boolean;
  submitAttemptNameJoin: boolean;
  modalRef?: BsModalRef;

  constructor (private dataService: DataService, private router: Router, private location: Location, private modalService: BsModalService) {}

  ngOnInit() {
    this.roomForm = new FormGroup({
      roomName: new FormControl(null, [
        Validators.required,
        Validators.minLength(11),
        Validators.pattern('[-\-_a-zA-Z0-9]*')
      ])
    });

    this.userForm = new FormGroup({
      name: new FormControl(null, [
        Validators.required,
        Validators.maxLength(20),
      ])
    });

    if (this.router.url != '/') {
      this.roomForm.setValue({
        roomName: this.router.url.substring(1)
      })
      this.openModal(this.join);
    }
  }

  public createRoom() {
    this.dataService.createRoom(this.name.value)
      .then(() => {
        this.router.navigate(['/interview'], { skipLocationChange: true });
      });
  }

  public joinRoom() {
    this.dataService.joinRoom(this.roomName.value.toLowerCase(), this.name.value)
    .then(() => { 
      this.router.navigate(['/interview'], { skipLocationChange: true });
    })
    .catch(() => {
      this.location.replaceState('');
      this.roomForm.reset();
    });
  }

  stopConnecting() {
    this.location.replaceState('');
    window.location.reload();
  }

  addDashToInput() {
    if (this.roomName.value) {
      let inputSplit = this.roomName.value.split('-').join('');
      let inputMatch = inputSplit.match(/.{1,3}/g).join('-');
      if(inputMatch.length == 3 || inputMatch.length == 7) {
        inputMatch += "-";
      }
      if(inputMatch.length > 11) {
        inputMatch = inputMatch.substring(0, 11);
      }
      this.roomForm.setValue({
        roomName: inputMatch
      })
    } 
  }

  removeDash() {
    if (this.roomName.value) {
      if(this.roomName.value.slice(-1) == "-") {
        this.roomForm.setValue({
          roomName: this.roomName.value.substring(0, this.roomName.value.length - 1)
        })
      }
    } 
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template,
      { class: 'modal-dialog-centered modal-md' }
    );
  }

  onSubmitJoin() {
    this.submitAttemptJoin = true;
    if (this.roomForm.valid) {
      this.openModal(this.join);
    }
  }

  onSubmitNameCreate() {
    this.submitAttemptNameCreate = true;
    if (this.name.valid) {
      this.createRoom();
      this.modalRef?.hide();
    }
  }

  onSubmitNameJoin() {
    this.submitAttemptNameJoin = true;
    if (this.name.valid) {
      this.joinRoom();
      this.modalRef?.hide();
    }
  }
}
