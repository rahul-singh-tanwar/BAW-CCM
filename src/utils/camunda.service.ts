import { Injectable, output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from './AuthService';

@Injectable({ providedIn: 'root' })
export class CamundaService {

  private token: string | null;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.token = this.authService.getToken();
  }

  private baseUrl = 'http://localhost:3000/bpm';
  private processIntanceKey = new BehaviorSubject<string>('');
  private proccessInstanceId = new BehaviorSubject<string>('');
  processIntanceKey$ = this.processIntanceKey.asObservable();
  proccessInstanceId$ = this.proccessInstanceId.asObservable();

  setProcessInstanceKey(key: string) {
    this.processIntanceKey.next(key);
  }

  private getAuthOptions() {
    return {
      headers: {
        BPMCSRFToken: this.authService.getCSRFToken() || '',
        Authorization: this.authService.getBasicAuthHeader(),
        'Content-Type': 'application/json'
      }
    };
  }

  startProcess(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/processes?model=${payload.model}&container=${payload.container}`, {input: payload.input}, this.getAuthOptions());
  }

  uploadFiles(files: File[]): Observable<any> {
    const formData = new FormData();

    files.forEach(file => formData.append('files', file));

    return this.http.post(`${this.baseUrl}/upload`, formData);
  }

  searchUserTasks(): Observable<any> {
    return this.http.get(`${this.baseUrl}/searchUserTasks`, this.getAuthOptions());
  }

  completeUserTask(userTaskKey: string, variables: any): Observable<any> {
   let output= Object.keys(variables).map(key => ({
    name: key,
    data: variables[key]   // BAW expects "value", not "data"
  }));
   
    return this.http.post(
      `${this.baseUrl}/user-tasks/${userTaskKey}/complete?optional_parts=data`,
      {output},
      this.getAuthOptions()
    );
  }

  getUserTaskByProcessInstance(processInstanceId: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/user-tasks?process_id=${processInstanceId}&states=claimed`,
    
      this.getAuthOptions()
    );
  }

  getUserTaskVariables(userTaskKey: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/user-tasks/${userTaskKey}/variables`,
      this.getAuthOptions()
    );
  }

  getUserTasks(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/user-tasks?states=claimed`,
    
      this.getAuthOptions()
    );
  }

  getAllUserTasks(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/user-tasks`,
    
      this.getAuthOptions()
    );
  }

}
