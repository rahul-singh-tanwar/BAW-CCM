import { Component, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, } from '@angular/material/dialog';
import { FileUpload } from '../file-upload/file-upload';
import { FormsModule, NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field'; // <mat-form-field>
import { MatInputModule } from '@angular/material/input';          // <input matInput>
import { MatButtonModule } from '@angular/material/button';
import { CamundaService } from '../../../../../utils/camunda.service';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-policy-details-dialog',
  imports: [FileUpload, CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './policy-details-dialog.html',
  styleUrls: ['./policy-details-dialog.css'],
})
export class PolicyDetailsDialog {

  physicianLicense: string = '';
  simbAmount: number | null = null;
  taskname = 'Upload Documents';
  userTaskKey = '';
  processInstanceKey = '';

  @ViewChild('labFiles') labFiles!: FileUpload;
  @ViewChild('formFiles') formFiles!: FileUpload;
  @ViewChild('otherFiles') otherFiles!: FileUpload;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PolicyDetailsDialog>,
    private camundaService: CamundaService
  ) { }

  close() {
    this.dialogRef.close();
  }

  getDateDifference(start: Date, end: Date): number {
    const diffMs = end.getTime() - start.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)); // Convert to days
  }
  

  submit(form: NgForm) {
    if (!form.valid) {
      form.control.markAllAsTouched();
      return;
    }

    let variables: any = {};

    // Collect uploaded files
    const uploadedFiles = {
      labFiles: this.labFiles.getFiles(),
      formFiles: this.formFiles.getFiles(),
      otherFiles: this.otherFiles.getFiles()
    };

    this.taskname = 'Upload Documents';
    this.camundaService.processIntanceKey$.pipe(

    tap(key => this.processInstanceKey = key),

    switchMap(() =>
      this.camundaService.getUserTaskByProcessInstance(
        this.processInstanceKey,
      //  this.taskname
      )
    ),

    tap(res => {
       this.userTaskKey = res.user_task_instances[0].id.split('.')[1];
    }),

    tap(() => {
      console.log('Preparing to complete task with variables: ', this.data);
      variables = {
        physicianNumber: this.physicianLicense,
        selectedPolicyNumber: this.data.policyNumber,
        eligibilityResults: this.data,
        simbAmount: this.simbAmount,
        uploadFiles: uploadedFiles,
        policyAge: this.getDateDifference(
          new Date(this.data.effectiveDate),
          new Date(this.data.firstUseDate)
        ),
        averageCost: 20.00,
        lengthOfStay: 12,
        diseaseDetails: "",
        selectedPackage: {
        "Name": "Appendectomy Standard 3D2N",
        "icdMatch": "K35",
        "network": "Gold network hospitals",
        "simbMatch": 80,
        "packagePrice": 45000,
        "standardTariff": 62000
        }
      };
    }),

    switchMap(() =>
      this.camundaService.completeUserTask(this.userTaskKey, variables)
    ),

    catchError(err => {
      console.error('❌ Error in workflow:', err);
      return of(null);
    })

  ).subscribe({
    next: () => {
      console.log('✔ Task completed successfully');
    }
  });


    // Expose payload to parent via close() or custom event
    this.close();
    // this.dialogRef.close(payload);
  }
}
