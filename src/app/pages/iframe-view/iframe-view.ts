import { Component, OnInit } from '@angular/core';
import { IframeService } from '../../services/iframe.service';
import { SafeUrlPipe } from '../../../utils/safe-url.pipe'; // adjust path as needed
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-iframe-view',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe], // ✅ import the pipe here
  templateUrl: './iframe-view.component.html',
  styleUrls: ['./iframe-view.component.css']
})
export class IframeView implements OnInit {
  iframeUrl: string | null = null;

  constructor(private iframeService: IframeService) {}

  ngOnInit() {

    //  this.iframeUrl = this.iframeService.getUrl();
    this.iframeUrl = 'http://localhost:8083/external/#/share/dashboard/9a9e7f32-0685-40c5-85c5-ea75b04a5c54?mode=embed&filter=%5B%5D';
   // this.iframeUrl = 'http://localhost:8083/external/#/share/report/e84005d7-d1d5-492e-896d-b5db6e4ae8b6?mode=embed';
  }
}

/*
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from '../../../utils/safe-url.pipe';

@Component({
  selector: 'app-iframe-view',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe],
  templateUrl: './iframe-view.component.html',
  styleUrls: ['./iframe-view.component.css']
})
export class IframeView implements OnInit {
  iframeUrls: string[] = [];

  ngOnInit() {
    // Load multiple iframe URLs when this page opens
    this.iframeUrls = [
      'http://localhost:8083/external/#/share/dashboard/9a9e7f32-0685-40c5-85c5-ea75b04a5c54?mode=embed&filter=%5B%5D',
      'http://localhost:8083/external/#/share/report/e84005d7-d1d5-492e-896d-b5db6e4ae8b6?mode=embed',
      'http://localhost:8083/external/#/share/dashboard/ef7a12a9-9d22-4c11-bd54-6f7e3b5a41a3?mode=embed'
    ];
  }
}
*/