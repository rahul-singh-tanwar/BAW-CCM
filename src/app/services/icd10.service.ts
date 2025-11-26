import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Icd10Service {

  constructor(private http: HttpClient) {}

  getCodes(): Observable<any[]> {
    return this.http.get<any[]>('/icd10.json');
  }
}
