import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { DataService } from '../_services/data.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.css']
})
export class ConsoleComponent {
  consoleOutput: string;
  dataServiceSubscription: Subscription;

  constructor (private dataService: DataService, private changeDetectorRef: ChangeDetectorRef, private toastr: ToastrService) {}

  ngOnInit() {
    this.dataServiceSubscription = this.dataService.console$.subscribe(runResponse => {
      if (runResponse.status.id == 3) {
        this.consoleOutput = runResponse.stdout;
        this.toastr.success("Code executed. " + "("+runResponse.user.userName+")", "", {
          positionClass: "toast-bottom-right",
        });
      } 
      else if (runResponse.status.id == 11) {
        this.consoleOutput = "ERROR: " + runResponse.message + ":\n" + runResponse.stderr;
        this.toastr.error("Code execution error. (Runtime Error)", "", {
          positionClass: "toast-bottom-right",
        });
      }
      else if (runResponse.status.id == 6) {
        this.consoleOutput = "ERROR: " + ":\n" + runResponse.compile_output;
        this.toastr.error("Code execution error. (Compilation Error)", "", {
          positionClass: "toast-bottom-right",
        });
      }
      this.changeDetectorRef.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.dataServiceSubscription.unsubscribe();
  }

}
