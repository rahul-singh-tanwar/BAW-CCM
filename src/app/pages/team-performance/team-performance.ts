import { Component, OnInit } from '@angular/core';
import { SafeUrlPipe } from '../../../utils/safe-url.pipe';
import { IframeService } from '../../services/iframe.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-team-performance',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe],
  templateUrl: './team-performance.html',
  styleUrl: './team-performance.css',
})

export class TeamPerformance implements OnInit {
  iframeUrl: string | null = null;


 constructor(private iframeService: IframeService) {}

  ngOnInit() {

   //  this.iframeUrl = this.iframeService.getUrl();
   // this.iframeUrl = 'http://localhost:8083/external/#/share/dashboard/9a9e7f32-0685-40c5-85c5-ea75b04a5c54?mode=embed&filter=%5B%5D';
    this.iframeUrl = 'http://localhost:8083/external/#/share/report/e84005d7-d1d5-492e-896d-b5db6e4ae8b6?mode=embed';
  }
}
