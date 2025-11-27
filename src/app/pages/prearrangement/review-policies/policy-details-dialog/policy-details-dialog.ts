import { Component, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog, MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, } from '@angular/material/dialog';
import { FileUpload } from '../file-upload/file-upload';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { CamundaService } from '../../../../../utils/camunda.service';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-policy-details-dialog',
  imports: [FileUpload, CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatRadioModule,
     ReactiveFormsModule,
  MatFormFieldModule,
  MatInputModule,
  MatAutocompleteModule,
  MatOptionModule
  ],
  templateUrl: './policy-details-dialog.html',
  styleUrls: ['./policy-details-dialog.css'],
})
export class PolicyDetailsDialog {

  physicianLicense: string = 'PHYS-123456';
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

  // SIMB — Standardized Items for K35 Appendicitis
simbControl = new FormControl('');
simbAll = [
  { code: 'SIMB-3001', description: 'Appendectomy Package', tariff: 45000 },
  { code: 'SIMB-3002', description: 'Surgeon Fee', tariff: 8000 },
  { code: 'SIMB-3003', description: 'Anesthesia Service', tariff: 6000 },
  { code: 'SIMB-3004', description: 'Operating Room Charge', tariff: 5000 },
  { code: 'SIMB-3005', description: 'Ward Stay (per day)', tariff: 3000 }
];
simbFiltered: any[] = [];

  ngOnInit() {
    // After packageList is populated:
    if (this.packageList?.length && !this.selectedPackage) {
      this.selectedPackage = this.packageList[0]; // default select
    }

    // ------- SIMB AUTOCOMPLETE -------
  this.simbControl.valueChanges.subscribe(value => {
    const term = (value || '').toLowerCase();
    this.simbFiltered = this.simbAll.filter(item =>
      item.code.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.tariff.toString().includes(term)
    );
  });
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
