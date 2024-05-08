import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Subject } from 'rxjs/internal/Subject';
import { WebSocketMessage } from '../_models/webSocketMessage';
import { RunRequest } from '../_models/runRequest';
import { Room } from '../_models/room';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'src/environments/environment';

const SIGNALLING_URL = environment.signallingUrl;

@Injectable({
  providedIn: 'root'
})

export class SignallingService {
  private triedConnecting: boolean = false;

  private socket$: WebSocketSubject<WebSocketMessage>;

  private connectedSubject = new Subject<boolean>();
  public connected$ = this.connectedSubject.asObservable();

  private rtcMessageSubject = new Subject<WebSocketMessage>();
  public rtcMessage$ = this.rtcMessageSubject.asObservable();

  private dataMessageSubject = new Subject<WebSocketMessage>();
  public dataMessage$ = this.dataMessageSubject.asObservable();

  constructor (private ngxSpinner: NgxSpinnerService) {}

  public connect(): void {
    if (!this.socket$ || this.socket$.closed) {
      this.getNewWebSocket();
      this.addIncomingMessageHandler();
    }
  }

  public disconnect(): void {
    this.socket$ = null;
  }

  public sendCreateMessage(userName: string): void {
    this.sendMessage({type: "create", data: userName});
  }

  public sendJoinMessage(roomName: string, userName: string): void {
    this.sendMessage({type: "join", data: {roomName: roomName, userName: userName}});
  }

  public sendOfferMessage(offer: RTCSessionDescriptionInit): void {
    this.sendMessage({type: "offer", data: offer});
  }

  public sendAnswerMessage(answer: RTCSessionDescription): void {
    this.sendMessage({type: "answer", data: answer});
  }

  public sendIceCandidateMessage(iceCandidate: RTCIceCandidate): void {
    this.sendMessage({type: "ice-candidate", data: iceCandidate});
  }

  public sendRoomMessage(room: Room): void {
    this.sendMessage({type: "room", data: room});
  }

  public sendRunMessage(runMessage: RunRequest): void {
    this.sendMessage({type: "run", data: runMessage})
  }

  private getNewWebSocket(): void {
    if (!this.triedConnecting){
      this.ngxSpinner.show("connect-spinner");
    }

    this.socket$ = webSocket({
      url: SIGNALLING_URL,
      openObserver: {
        next: () => {
          this.connectedSubject.next(true);
          this.ngxSpinner.hide("connect-spinner");
          this.ngxSpinner.hide("reconnect-spinner");
        }
      },
      closeObserver: {
        next: () => {
          this.ngxSpinner.hide("connect-spinner");
          this.ngxSpinner.show("reconnect-spinner");
          this.connectedSubject.next(false);
          this.socket$ = undefined;
          this.connect();
        }
      }
    });

    this.triedConnecting = true;
  }

  private addIncomingMessageHandler(): void {
    this.socket$.subscribe(
      message => {

        console.log('Received message of type: ' + message.type);

        switch (message.type) {
          case "connection":
            this.dataMessageSubject.next(message);
            break;
          case "offer":
            this.rtcMessageSubject.next(message);
            break;
          case "answer":
            this.rtcMessageSubject.next(message);
            break;
          case "ice-candidate":
            this.rtcMessageSubject.next(message);
            break;
          case "room":
            this.dataMessageSubject.next(message);
            break;
          case "run":
            this.dataMessageSubject.next(message);
            break;
          default:
            console.log('Unknown message of type ' + JSON.stringify(message));
        }
      }
    );
  }

  private sendMessage(message: WebSocketMessage): void {
    this.socket$.next(message);
  }

}
