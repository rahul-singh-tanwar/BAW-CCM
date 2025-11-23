import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import {  } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import * as CcmWorkDTO from '../ccm-workDTO';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';   // if still using radios anywhere
import { CamundaService } from '../../../../../utils/camunda.service';

@Component({
  selector: 'app-ccm-work-queue',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatRadioModule
  ],
  templateUrl: './ccm-work-queue.html',
  styleUrl: './ccm-work-queue.css',
})
export class CcmWorkQueue {

  constructor(
    public dialogRef: MatDialogRef<CcmWorkQueue>,
    @Inject(MAT_DIALOG_DATA) public data: CcmWorkDTO.ReadonlyPopupData,
    private camundaService: CamundaService
  ) { }

  close() {
    this.dialogRef.close();
  }

  // === APPROVAL & WORKFLOW FIELDS ===
  isApproved: boolean = false;           // Checkbox
  isExternalPending: boolean = false;    // Checkbox

  referToTeam: string | null = null;     // Dropdown selected value

  // Dropdown list
  teamList = [
    { key: 'MedicalStaffManagerTeam', value: "Manager's Team" },
    { key: 'DoctorTeam', value: "Doctor's Team" },
    { key: 'ClaimTeam', value: "Claims Team" }
  ];

  hasAnyUploaded(): boolean {
    console.log("Uploaded Documents:", this.data);
    const docs = this.data.uploadedDocuments;
    return docs?.formFiles?.length || docs?.labFiles?.length || docs?.otherFiles?.length ? true : false;
  }

  formatDate(dateString: any): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';

  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();

  return `${yyyy}-${mm}-${dd}`;
}

  onSubmit() {
    const payload = {
      isApproved: this.isApproved,
      isExternalPending: this.isExternalPending,
      referToTeam: this.referToTeam || '',
    };

    

    let taskKey = this.data.userTaskKey || '';
    
    this.camundaService.completeUserTask(taskKey, payload)
      .subscribe(response => {
        console.log('User task completed successfully:', response);
      }, error => {
        console.error('Error completing user task:', error);
      });
    

    this.dialogRef.close(payload);
  }

}