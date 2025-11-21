import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { IframeService } from '../../services/iframe.service';
import { CamundaService } from '../../../utils/camunda.service';
import { AuthService } from '../../../utils/AuthService';

@Component({
  selector: 'app-left-nav',
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  templateUrl: './left-nav.html',
  styleUrl: './left-nav.css',
})
export class LeftNav {
   @Input() collapsed = false;
   @Output() titleChange = new EventEmitter<string>();

   private static readonly PREARRANGEMENT_ROUTE = '/prearrangement';

   constructor(
    private iframeService: IframeService, 
    private router: Router, 
    private camundaService: CamundaService, 
    public auth: AuthService
   ) {}

  private routeTitleMap: { [key: string]: string } = {
    '/user-tasks': 'Work',
    '/process': 'Process',
    '/process-performance': 'Process Performance',
    '/team-performance': 'Team Performance',
    '/ccm-work-queue': 'CCM Work Queue',
    '/prearrangement': 'Launch',
  };

  openIframe(url: string) {
    this.iframeService.setUrl(url);
    this.router.navigate(['/iframe']);
    this.titleChange.emit('External Content');
  }

  navigateTo(route: string) {
    const title = this.routeTitleMap[route];
    if (title) {
      this.titleChange.emit(title);
    }

    this.router.navigate([route]);
    // if(route === LeftNav.PREARRANGEMENT_ROUTE) {  
    //   const payload = {
    //     processDefinitionId: 'PreArrangementProcess',
    //     processDefinitionVersion: -1,
    //     variables: {}
    //   }

    //   this.camundaService.startProcess(payload)
    //     .subscribe((response: any) => {

    //       const processInstanceKey = response?.processInstanceKey;
    //       this.camundaService.setProcessInstanceKey(processInstanceKey || '');
    //       console.log('Process started successfully:', response);
    //     }, error => {
    //       console.error('Error starting process:', error);
    //     }
    //   );
    // }
    // .then((response: any) => {

    //   const processInstanceKey = response?.processInstanceKey;

    //   this.camundaService.setProcessInstanceKey(processInstanceKey || '');
    //   console.log('Process started successfully:', response);
    // }).catch(error => {
    //   console.error('Error starting process:', error);
    // });
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, { paths: 'exact', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' });
  }

}
