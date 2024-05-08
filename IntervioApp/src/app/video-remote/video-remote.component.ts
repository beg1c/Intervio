import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { RtcService } from '../_services/rtc.service';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { DataService } from '../_services/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-video-remote',
  templateUrl: './video-remote.component.html',
  styleUrls: ['./video-remote.component.css']
})
export class VideoRemoteComponent implements AfterViewInit {
  @ViewChild('remote_video') remoteVideo: ElementRef;
  style = "color: #A4ABB6;"
  faCircleXmark = faCircleXmark;
  participant = "Nobody here";

  rtcServiceSubscription: Subscription;
  dataServiceSubscription: Subscription;


  constructor (private rtcService: RtcService, private dataService: DataService) {}

  ngAfterViewInit(): void {
    this.rtcServiceSubscription = this.rtcService.remoteStream$.subscribe((stream: MediaStream) => {
      this.remoteVideo.nativeElement.srcObject = stream;
    })

    this.dataServiceSubscription = this.dataService.connection$.subscribe(connection => {
      connection.users.forEach(user => {
        if (user != this.dataService.userName)
        {
          this.participant = user;
          this.style = "color: #bae67e;"
        }
      })

      if (connection.users.length == 2) {
        if (connection.users[0] == connection.users[1]) {
          this.participant = connection.users[0];
          this.style = "color: #bae67e;"
        }
      }

      if (connection.users.length == 1) {
        this.participant = "Nobody here";
        this.style = "color: #A4ABB6;"
        this.remoteVideo.nativeElement.srcObject = null;
      }
    })
  }

  ngOnDestroy() {
    this.rtcServiceSubscription.unsubscribe();
    this.dataServiceSubscription.unsubscribe();
  }
}
