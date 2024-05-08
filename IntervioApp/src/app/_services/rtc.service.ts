import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { SignallingService } from './signalling.service';
import { environment } from 'src/environments/environment';


export const configuration = { 'iceServers': environment.iceServers };


const offerOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
};

@Injectable({
  providedIn: 'root'
})

export class RtcService {
  private peerConnection: RTCPeerConnection;
  private messageSubscription: Subscription;

  public localStream: MediaStream;
  public localStream$ = new Subject<MediaStream>();
  public remoteStream$ = new Subject<MediaStream>();

  constructor(private signallingService: SignallingService) { }

  async startCommunication(): Promise<void> {
    this.addIncomingMessageHandler();
    this.createPeerConnection();
    this.handleStream(this.localStream);

    const offer: RTCSessionDescriptionInit = await this.peerConnection.createOffer(offerOptions);
    await this.peerConnection.setLocalDescription(offer);

    this.signallingService.sendOfferMessage(offer);
  }

  async stopCommunication(): Promise<void> {
    this.peerConnection.close();
    this.messageSubscription.unsubscribe();
  }

  public startLocalVideo(): void {
    this.localStream.getVideoTracks().forEach(track => {
      track.enabled = true;
    })
  }
  public stopLocalVideo(): void {
    this.localStream.getVideoTracks().forEach(track => {
      track.enabled = false;
    })
  }

  public startLocalAudio(): void {
    this.localStream.getAudioTracks().forEach(track => {
      track.enabled = true;
    })
  }

  public stopLocalAudio(): void {
    this.localStream.getAudioTracks().forEach(track => {
      track.enabled = false;
    })
  }

  private addIncomingMessageHandler(): void {
    this.messageSubscription = this.signallingService.rtcMessage$.subscribe(
      message => {
        switch (message.type) {
          case "offer":
            this.handleOfferMessage(message.data);
            break;
          case "answer":
            this.handleAnswerMessage(message.data);
            break;
          case "ice-candidate":
            this.handleICECandidateMessage(message.data);
            break;
        }
      });
  }

  private handleOfferMessage(message: RTCSessionDescriptionInit): void {
    if (!this.peerConnection) {
      this.createPeerConnection();
    }

    this.peerConnection.setRemoteDescription(new RTCSessionDescription(message)).then(() => {
      return this.peerConnection.createAnswer();
    }).then((answer) => {
      return this.peerConnection.setLocalDescription(answer);
    }).then(() => {
      this.signallingService.sendAnswerMessage(this.peerConnection.localDescription);
    });
  }

  private handleAnswerMessage(message: RTCSessionDescriptionInit): void {
    this.peerConnection.setRemoteDescription(message);
  }


  private handleICECandidateMessage(message: RTCIceCandidate): void {
    const candidate = new RTCIceCandidate(message);
    this.peerConnection.addIceCandidate(candidate);
  }

  private createPeerConnection(): void {
    this.peerConnection = new RTCPeerConnection(configuration);
    this.peerConnection.onicecandidate = this.handleICECandidateEvent;
    this.peerConnection.ontrack = this.handleTrackEvent;
  }


  private handleICECandidateEvent = (event: RTCPeerConnectionIceEvent) => {
    if (event.candidate) {
      this.signallingService.sendIceCandidateMessage(event.candidate);
    }
  }

  private handleTrackEvent = (event: RTCTrackEvent) => {
    this.remoteStream$.next(event.streams[0]);
  }

  private handleStream(stream: MediaStream): void {
    stream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, stream)
    });
    this.localStream$.next(stream);
  }

}
