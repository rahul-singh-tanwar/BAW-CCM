import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
 
@Component({
  selector: 'app-provider-details-dialog',
  imports: [
    CommonModule,
    MatTabsModule
  ],
  templateUrl: './provider-details-dialog.html',
  styleUrl: './provider-details-dialog.css',
})
export class ProviderDetailsDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}