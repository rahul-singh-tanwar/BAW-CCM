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
import { MatDialog } from '@angular/material/dialog';
import { providers } from '../../../provider/providerDetails';
import { ProviderDetailsDialog } from '../../../provider/provider-details-dialog/provider-details-dialog';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


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
    MatRadioModule,
    MatDialogModule,
    MatCardModule,
    MatOptionModule,
    

  ],
  templateUrl: './ccm-work-queue.html',
  styleUrl: './ccm-work-queue.css',
})
export class CcmWorkQueue {

  constructor(
    public dialogRef: MatDialogRef<CcmWorkQueue>,
    @Inject(MAT_DIALOG_DATA) public data: CcmWorkDTO.ReadonlyPopupData,
    private camundaService: CamundaService,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) { }

  close() {
    this.dialogRef.close();
  }

    actionMode: string = 'refer';
  // === APPROVAL & WORKFLOW FIELDS ===
  isApproved: boolean = false;           // Checkbox
  isExternalPending: boolean = false;    // Checkbox

  referToTeam: string | null = null;     // Dropdown selected value
  providers = providers;
 
  providerCode: string = '';
  previewUrl: SafeResourceUrl | null = null;
  rawUrl: string | null = null;
  zoomLevel: number = 1;

  // Dropdown list
  teamList = [
    { key: 'MedicalStaffManagerTeam', value: "Manager's Team" },
    { key: 'DoctorTeam', value: "Doctor's Team" },
    { key: 'ClaimTeam', value: "Claims Team" }
  ];

  previewFile(file: any) {
    console.log("Previewing file:", file);
    // Replace this later with actual file URL
    this.rawUrl = `http://localhost:3000${file.url}`;
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawUrl);
    this.zoomLevel = 1;
  }
 
  closePreview() {
    this.previewUrl = null;
  }
 
  zoomIn() {
    this.zoomLevel += 0.2;
  }
 
  zoomOut() {
    if (this.zoomLevel > 0.4) this.zoomLevel -= 0.2;
  }
 
  isImage(): boolean {
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(this.rawUrl || '');
    // console.log("Checking if image for URL:", isImage);
    return /\.(jpg|jpeg|png|gif)$/i.test(this.rawUrl || '');
  }
 
  isPdf(): boolean {
    const isPdf = /\.pdf$/i.test(this.rawUrl || '');
    console.log("Checking if PDF for URL:", this.rawUrl);
    return /\.pdf$/i.test(this.rawUrl || '');
  }

  hasAnyUploaded(): boolean {
    console.log("Uploaded Documents:", this.data);
    const docs = this.data.uploadedDocuments;
    return docs?.formFiles?.items?.length || docs?.labFiles?.items?.length || docs?.otherFiles?.items?.length ? true : false;
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
openProviderDialog() {
 
    const providerData = this.providers.find(p => p.code === this.providerCode)?.details;
    if(!providerData) return;
    this.dialog.open(ProviderDetailsDialog, {
      width: '1000px',
      maxHeight: '90vh',
      data: providerData
    });
  }
  onSubmit() {

    if(this.actionMode === "approval"){
      this.isApproved = true;
    }
    else{
      this.isApproved = false;
    }
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