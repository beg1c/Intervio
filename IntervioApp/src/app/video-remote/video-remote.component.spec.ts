import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoRemoteComponent } from './video-remote.component';

describe('VideoRemoteComponent', () => {
  let component: VideoRemoteComponent;
  let fixture: ComponentFixture<VideoRemoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoRemoteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoRemoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
