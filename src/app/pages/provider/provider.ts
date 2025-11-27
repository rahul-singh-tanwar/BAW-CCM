import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ProviderDetailsDialog } from './provider-details-dialog/provider-details-dialog';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { providers } from '../provider/providerDetails';
 
@Component({
  selector: 'app-provider',
  imports: [
    CommonModule,
    ProviderDetailsDialog,
    MatTableModule,
    MatDialogModule,
    MatTabsModule
  ],
  templateUrl: './provider.html',
  styleUrl: './provider.css',
})
export class Provider {
 
  constructor(private dialog: MatDialog) {}
  providers = providers;
 
  // providers = [
  //   {
  //     providerName: 'Alpha Hospital',
  //     code: 'HSP001',
  //     address: 'Downtown Street 42',
  //     networkStatus: 'In Network',
  //     activeContracts: 3,
  //     details: {
  //       contracts: [
  //         {
  //           id: 'C1001',
  //           company: 'Both',
  //           productLine: 'IPD',
  //           effectiveDate: '2023-01-01',
  //           expiryDate: '2025-01-01',
  //           status: 'Active'
  //         },
  //         {
  //           id: 'C1002',
  //           company: 'Life',
  //           productLine: 'OPD',
  //           effectiveDate: '2022-06-01',
  //           expiryDate: '2024-06-01',
  //           status: 'Expiring soon'
  //         }
  //       ],
  //       packages: [
  //         {
  //           id: 'P2001',
  //           name: 'Maternity Gold',
  //           coverageType: 'Maternity',
  //           baseTariff: '1500 USD',
  //           roomType: 'Private',
  //           eligiblePlan: 'Premium'
  //         },
  //         {
  //           id: 'P2002',
  //           name: 'Surgical Basic',
  //           coverageType: 'Surgical',
  //           baseTariff: '900 USD',
  //           roomType: 'Semi-private',
  //           eligiblePlan: 'Standard'
  //         }
  //       ],
  //       doctors: [
  //         { name: 'Dr. Sarah Connor', specialty: 'Gynecologist', status: 'Active' },
  //         { name: 'Dr. John Doe', specialty: 'Surgeon', status: 'Visiting' }
  //       ]
  //     }
  //   }
  // ];
 
  openDetails(provider: any) {
    this.dialog.open(ProviderDetailsDialog, {
      width: '90vw',
      maxWidth: '900px',
      height: '40vh',
      data: provider.details
    });
  }
 
}
 
 