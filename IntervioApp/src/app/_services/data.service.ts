import { Injectable } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { SignallingService } from './signalling.service';
import { RunResponse } from '../_models/runResponse';
import { RunRequest } from '../_models/runRequest';
import { Room } from '../_models/room';
import { ConnectionResponse } from '../_models/connectionResponse';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})

export class DataService {
  loadedRoom: Room;
  userName: string;
  
  private roomSubject = new Subject<Room>();
  room$ = this.roomSubject.asObservable();

  private consoleSubject = new Subject<RunResponse>();
  console$ = this.consoleSubject.asObservable();

  private connectionSubject = new ReplaySubject<ConnectionResponse>(1)
  connection$ = this.connectionSubject.asObservable();

  constructor(private signallingService: SignallingService, private ngxSpinner: NgxSpinnerService, private toastr: ToastrService) {
    this.addIncomingMessageHandler();
  }

  public createRoom(userName: string): Promise<void> {
    return new Promise<void>((resolve) => {
      this.signallingService.connect();

      var subscription = this.signallingService.connected$.subscribe(connected => {
        if (connected == true) {
          this.ngxSpinner.show("creating-spinner");
          this.signallingService.sendCreateMessage(userName);
    
          this.connection$.subscribe(connection => {
            if(connection.status == "ok") {
                this.loadedRoom = connection.room;
                this.userName = userName;
                this.ngxSpinner.hide("creating-spinner");
                this.maintainConnection();
                subscription.unsubscribe();
                resolve();
            }
          });
        }
      })
    });
  }

  public joinRoom(roomName: string, userName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.signallingService.connect();

      var subscription = this.signallingService.connected$.subscribe(connected => {
        if (connected == true) {
          this.ngxSpinner.show("joining-spinner");
          this.signallingService.sendJoinMessage(roomName, userName);

          this.connection$.subscribe(connection => {
            if(connection.status == "ok") {
              this.loadedRoom = connection.room;
              this.userName = userName;
              this.ngxSpinner.hide("joining-spinner");
              this.maintainConnection();
              subscription.unsubscribe();
              resolve();
            }
            else if(connection.status == "invalid") {
              this.ngxSpinner.hide("joining-spinner");
              this.toastr.clear();
              this.toastr.error("Room you are trying to join doesn't exist.", "", {
                closeButton: true,
                positionClass: "toast-bottom-right",
                disableTimeOut: true,
              });
              subscription.unsubscribe();
              this.signallingService.disconnect();
              reject();
            }
            else if(connection.status == "full") {
              this.ngxSpinner.hide("joining-spinner");
              this.toastr.clear();
              this.toastr.error("Room you are trying to join is full. Max 2 participants per room.", "", {
                closeButton: true,
                positionClass: "toast-bottom-right",
                disableTimeOut: true,
              });
              subscription.unsubscribe();
              this.signallingService.disconnect();
              reject();
            }
          });
        }
      })
    });
  }

  public setUserName(userName: string): void {
    this.userName = userName;
  }

  public sendRoomData(room: Room): void {
    this.signallingService.sendRoomMessage(room);
  } 

  public sendRunData(runMessage: RunRequest): void {
    this.signallingService.sendRunMessage(runMessage);
  }

  private addIncomingMessageHandler(): void {

    this.signallingService.dataMessage$.subscribe(
      message => {
        switch (message.type) {
          case "connection":
            this.handleConnectionMessage(message.data);
            break;
          case "room":
            this.handleRoomMessage(message.data);
            break;
          case "run":
            this.handleRunMessage(message.data);
            break;
        }
      })
  }

  private handleConnectionMessage(connection: ConnectionResponse): void {
    this.connectionSubject.next(connection);
  }

  private handleRoomMessage(room: Room): void {
    this.roomSubject.next(room);
  }

  private handleRunMessage(runResponse: RunResponse): void {
    this.consoleSubject.next(runResponse);
  }

  private maintainConnection(): void {
    this.signallingService.connected$.subscribe(connected => {
      if (connected == true) {
        this.ngxSpinner.show("joining-spinner");
        this.signallingService.sendJoinMessage(this.loadedRoom.name, this.userName);

        this.connection$.subscribe(connection => {
          if(connection.status == "ok") {
            this.ngxSpinner.hide("joining-spinner");
            this.loadedRoom = connection.room;
          }
        });
      }
    });
  }
}
