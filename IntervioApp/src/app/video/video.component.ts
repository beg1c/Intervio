import { AfterViewInit, Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { RtcService } from '../_services/rtc.service';
import { faVideo, faVideoSlash, faMicrophone, faMicrophoneSlash, faGear, faRepeat, faCircleCheck} from '@fortawesome/free-solid-svg-icons';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { DataService } from '../_services/data.service';
import { Subscription } from 'rxjs';
import DecibelMeter from 'decibel-meter'

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})

export class VideoComponent implements AfterViewInit {
  @ViewChild('local_video') localVideo: ElementRef;

  modalRef?: BsModalRef;

  myName:string;

  faVideo = faVideo;
  faMicrophone = faMicrophone;
  faGear = faGear;
  faRepeat = faRepeat;
  faCircleCheck = faCircleCheck;

  audioInputDevices: Array<MediaDeviceInfo> = [];
  //audioOutputDevices: Array<MediaDeviceInfo> = [];
  videoInputDevices: Array<MediaDeviceInfo> = [];

  videoClass: string;
  noVideoClass: string = "video-overlay-failed-hidden";
  activeVideoClass: string = "video-overlay-active";
  disabledVideoClass: string = "video-overlay-disabled-hidden"

  audioButtonDisabled = false;
  videoButtonDisabled = false;
  repeatButtonHidden = true;

  video = true;
  audio = true;

  mediaMessage: string;

  volume: number = 0;
  meter: DecibelMeter = new DecibelMeter('microphone-volume');

  rtcServiceSubscription: Subscription;

  constructor (private rtcService: RtcService, private dataService: DataService, private modalService: BsModalService, private ngxSpinner: NgxSpinnerService) {}

  ngAfterViewInit(): void {
    this.rtcServiceSubscription = this.rtcService.localStream$.subscribe((stream: MediaStream) => {
      this.localVideo.nativeElement.srcObject = stream;
    })

    this.myName = this.dataService.userName;
    this.connect();
  }

  ngOnDestroy() {
    this.rtcServiceSubscription.unsubscribe();
  }

  async connect() {
    this.ngxSpinner.show("video-spinner");

    this.getDevices().then(constraints => {
      navigator.mediaDevices.getUserMedia(constraints)
      .then(media => {
        this.rtcService.localStream = media;
        this.rtcService.startCommunication();
        this.ngxSpinner.hide("video-spinner");
        this.disconnectDecibelMeter();
        this.connectDecibelMeter(this.audioInputDevices[0].deviceId);
      });
    });
  }

  getDevices() {
    return new Promise<MediaStreamConstraints>((resolve, reject) => {

      this.audioInputDevices = [];
      this.videoInputDevices = [];

      navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        devices.forEach(device => {
          if (device.kind == "audioinput") {
            this.audioInputDevices.push(device);
          }
          else if (device.kind == "videoinput") {
            this.videoInputDevices.push(device);
          }
        });

        if (this.audioInputDevices.length == 0) {
          this.faMicrophone = faMicrophoneSlash;
          this.faVideo = faVideo;
          this.mediaMessage = "microphone";
          this.audioButtonDisabled = true;
          this.repeatButtonHidden = false;
          resolve({ audio: false, video: true });
        }
        else if (this.videoInputDevices.length == 0) {
          this.faVideo = faVideoSlash;
          this.faMicrophone = faMicrophone;
          this.mediaMessage = "camera";
          this.videoButtonDisabled = true;
          this.repeatButtonHidden = false;
          this.noVideoClass = "video-overlay-failed";
          resolve({ audio: true, video: false });
        }
        else if (this.videoInputDevices.length == 0 && this.audioInputDevices.length == 0) {
          this.faVideo = faVideoSlash;
          this.faMicrophone = faMicrophoneSlash;
          this.mediaMessage = "microphone and camera";
          this.videoButtonDisabled = true;
          this.audioButtonDisabled = true;
          this.repeatButtonHidden = false;
          this.noVideoClass = "video-overlay-failed";
          resolve({ audio: false, video: false });
        }
        else {
          this.faVideo = faVideo;
          this.faMicrophone = faMicrophone;
          this.videoButtonDisabled = false;
          this.audioButtonDisabled = false;
          this.repeatButtonHidden = true;
          this.noVideoClass = "video-overlay-failed-hidden";
          resolve({ audio: true, video: true });
        }
      })

    });
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: "modal-dialog-centered"});
  }

  selectAudioInput(device: MediaDeviceInfo): void {
    let index = this.audioInputDevices.indexOf(device);

    if (index != -1) {
    this.audioInputDevices.splice(index, 1);
    this.audioInputDevices.unshift(device);
    }

    this.rtcService.stopCommunication().then(() => {
      var constraints = { deviceId: { exact: device.deviceId } };

      navigator.mediaDevices.getUserMedia({ audio: constraints, video: false })
      .then(media => {
        this.rtcService.localStream = media;
        this.rtcService.startCommunication();
        this.disconnectDecibelMeter();
        this.connectDecibelMeter(this.audioInputDevices[0].deviceId);
      });
    });
  }

  selectVideoInput(device: MediaDeviceInfo): void {
    let index = this.videoInputDevices.indexOf(device);

    if (index != -1) {
    this.videoInputDevices.splice(index, 1);
    this.videoInputDevices.unshift(device);
    }

    this.rtcService.stopCommunication().then(() => {
      var constraints = { deviceId: { exact: device.deviceId } };

      navigator.mediaDevices.getUserMedia({ audio: true, video: constraints })
      .then(media => {
        this.rtcService.localStream = media;
        this.rtcService.startCommunication();
        this.disconnectDecibelMeter();
        this.connectDecibelMeter(this.audioInputDevices[0].deviceId);
      });
    });
  }

  startStopVideo(): void {
    if (this.video) {
      this.rtcService.stopLocalVideo();
      this.video = false;
      this.faVideo = faVideoSlash;
      this.videoClass = "videoOff";
      this.disabledVideoClass = "video-overlay-disabled";
    }
    else {
      this.rtcService.startLocalVideo();
      this.video = true;
      this.faVideo = faVideo;
      this.videoClass = null;
      this.disabledVideoClass = "video-overlay-disabled-hidden";
    }
  }

  startStopAudio(): void {
    if (this.audio) {
      this.rtcService.stopLocalAudio();
      this.audio = false;
      this.faMicrophone = faMicrophoneSlash;
      this.disconnectDecibelMeter();
    }
    else {
      this.rtcService.startLocalAudio();
      this.audio = true;
      this.faMicrophone = faMicrophone;
      this.connectDecibelMeter(this.audioInputDevices[0].deviceId);
    }
  }

  private connectDecibelMeter(deviceId: string) {
    this.meter.connectTo(deviceId);
    this.meter.listenTo(0, (dB, percent) => this.volume = Number(`${dB}`) + 100);
  }

  private disconnectDecibelMeter() {
    if (this.meter != null) {
      this.meter.disconnect();
    }
  }
}
