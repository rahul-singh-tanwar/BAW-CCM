import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { PolicyDetailsDialog } from './policy-details-dialog/policy-details-dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-review-policies',
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatRadioModule,
    MatDialogModule,
    PolicyDetailsDialog,
    MatButtonToggleModule
  ],
  templateUrl: './review-policies.html',
  styleUrls: ['./review-policies.css']
})
export class ReviewPolicies {
  dataSource = [
    {
      companyName: 'Allianz Ayudhya',
      policyType: 'A&H',
      policyNumber: 'PA-2025-044444',
      policyStatus: 'Inforce',
      effectiveDate: '2023-01-01',
      expiryDate: '2024-01-01',
      firstUseDate: '2023-02-01',
      benefits: [
        { name: 'Hospitalization', limit: '฿200,000', remarks: 'Covers room rent' },
        { name: 'Medicines', limit: '฿50,000', remarks: 'Prescription only' }
      ]
    },
    {
      companyName: 'Allianz Ayudhya',
      policyType: 'A&H',
      policyNumber: 'PA-2025-055555',
      policyStatus: 'Inforce',
      effectiveDate: '2021-03-10',
      expiryDate: '2024-03-10',
      firstUseDate: '2021-09-01',
      benefits: [
        { name: 'Death Benefit', limit: '฿100,000', remarks: 'Full coverage' },
        { name: 'Accidental Cover', limit: '฿500,000', remarks: 'Covers accidental death' }
      ]
    },
    {
      companyName: 'Allianz Ayudhya',
      policyType: 'L&H',
      policyNumber: 'OL-2023-099999',
      policyStatus: 'Inforce',
      effectiveDate: '2024-06-01',
      expiryDate: '2025-06-01',
      firstUseDate: '2024-06-15',
      benefits: [
        { name: 'Death Benifit', limit: '฿100,000', remarks: 'Includes delay compensation' },
        { name: 'Medical Emergency', limit: '฿300,000', remarks: 'Covers hospitalization abroad' }
      ]
    },
    {
      companyName: 'Allianz Ayudhya',
      policyType: 'L&H',
      policyNumber: 'OL-2023-088888',
      policyStatus: 'Inforce',
      effectiveDate: '2022-09-10',
      expiryDate: '2023-09-10',
      firstUseDate: '2023-10-01',
      benefits: [
        { name: 'Surgery Cover', limit: '฿150,000', remarks: 'Pre-approved surgeries only' },
        { name: 'Diagnostics', limit: '฿25,000', remarks: 'Covers lab tests' }
      ]
    }
  ];

  displayedColumns = [
    'select', 'companyName', 'policyType', 'policyNumber',
    'policyStatus', 'effectiveDate', 'expiryDate', 'firstUseDate', 'benefits'
  ];

  expandedRow: any = null;
  selectedRow: any;

  constructor(private dialog: MatDialog) {}

  toggleRow(row: any) {
    this.expandedRow = this.expandedRow === row ? null : row;
  }

  onSelectRow(row: any) {
    this.selectedRow = row;
    this.dialog.open(PolicyDetailsDialog, {
      width: '90vw',
      maxWidth: '1100px',
      height: '90vh',
      panelClass: 'custom-policy-dialog',
      data: row
    });

  }

    selectedPolicyFilter: string = 'A&H';  // default

originalData: any[] = []; // untouched full list
//dataSource: any[] = [];   // filtered table list

ngOnInit() {
  // When your table loads data, keep a copy of full list.
  this.originalData = [...this.dataSource];
  this.filterByPolicyType();
}

onPolicyFilterChange(value: string) {
  this.selectedPolicyFilter = value;
  this.filterByPolicyType();
}

filterByPolicyType() {
  this.dataSource = this.originalData.filter(
    x => x.policyType === this.selectedPolicyFilter
  );
}
}
