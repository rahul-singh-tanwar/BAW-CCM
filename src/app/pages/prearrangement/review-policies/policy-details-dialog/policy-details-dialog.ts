import { Component, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog, MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, } from '@angular/material/dialog';
import { FileUpload } from '../file-upload/file-upload';
import { FormsModule, NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { CamundaService } from '../../../../../utils/camunda.service';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-policy-details-dialog',
  imports: [FileUpload, CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatRadioModule],
  templateUrl: './policy-details-dialog.html',
  styleUrls: ['./policy-details-dialog.css'],
})
export class PolicyDetailsDialog {

  physicianLicense: string = '';
  simbAmount: number | null = null;
  taskname = 'Upload Documents';
  userTaskKey = '';
  processInstanceKey = '';
  averageCost: number | null = null;
  lengthOfStay: number | null = null;
  diseaseDetails: string = '';

  selectedPackage: any = null;
  packageList = [
    {
      Name: "Appendectomy Standard 3D2N",
      icdMatch: "K35",
      network: "Gold network hospitals",
      simbMatch: 80,
      packagePrice: 45000,
      standardTariff: 62000
    },
    {
      Name: "Appendectomy Premium 3D2N",
      icdMatch: "K35",
      network: "Platinum network",
      simbMatch: 90,
      packagePrice: 56000,
      standardTariff: 72000
    }
  ];

  ngOnInit() {
    // After packageList is populated:
    if (this.packageList?.length && !this.selectedPackage) {
      this.selectedPackage = this.packageList[0]; // default select
    }
  }


  @ViewChild('labFiles') labFiles!: FileUpload;
  @ViewChild('formFiles') formFiles!: FileUpload;
  @ViewChild('otherFiles') otherFiles!: FileUpload;

  isSubmitted: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PolicyDetailsDialog>,
    private camundaService: CamundaService,
    private dialog: MatDialog,
    private router: Router
  ) { }
  
 

  close() {
    this.dialog.closeAll();
  }

  getDateDifference(start: Date, end: Date): number {
    const diffMs = end.getTime() - start.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)); // Convert to days
  }
  

  submit(form: NgForm) {
    this.isSubmitted = true;
    if (!form.valid || !this.selectedPackage) {
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
          this.processInstanceKey.split('.')[1],
          
        )
      ),
      tap(res => {
        this.userTaskKey = res.user_task_instances[0].id.split('.')[1];
      }),
      tap(() => {
        variables = {
          physicianNumber: this.physicianLicense,
          selectedPolicyNumber: this.data.policyNumber,
          eligibilityResults: this.data,
          simbAmount: this.simbAmount,
          averageCost: this.averageCost,
          lengthOfStay: this.lengthOfStay,
          diseaseDetails: this.diseaseDetails,
          selectedPackage: this.selectedPackage,
          uploadFiles: uploadedFiles,
          policyAge: this.getDateDifference(
            new Date(this.data.effectiveDate),
            new Date(this.data.firstUseDate)
          ),
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
      next: (result) => {
        if (result) {
          console.log('✔ Task completed successfully');
            this.dialogRef.afterClosed().subscribe(() => {
            this.router.navigate(['/user-tasks']);
            });
            this.close();
        }
      }
    });
  }
}
