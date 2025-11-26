import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Icd9Service {

  constructor(private http: HttpClient) {}

  getCodes(): Observable<any[]> {
    return this.http.get<any[]>('/icd9.json'); // served from public/
  }
}
