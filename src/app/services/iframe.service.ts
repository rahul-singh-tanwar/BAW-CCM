import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IframeService {
  private iframeUrl: string | null = null;

  setUrl(url: string) {
    this.iframeUrl = url;
  }

  getUrl(): string | null {
    return this.iframeUrl;
  }

  clear() {
    this.iframeUrl = null;
  }
}
