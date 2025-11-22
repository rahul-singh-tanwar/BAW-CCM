import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import jsPDF from 'jspdf';
import { CamundaService } from '../../../utils/camunda.service';
import * as CcmWorkDTO from '../prearrangement/user-tasks/ccm-workDTO';

@Component({
  selector: 'app-gop-document',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './gop-document.html',
  styleUrls: ['./gop-document.css']
})
export class GopDocument {
  
  isDownloading = false;
  private logoBase64: string = '';
  
  constructor(
    private http: HttpClient,
    public dialogRef: MatDialogRef<GopDocument>,
    private camundaService: CamundaService,
    @Inject(MAT_DIALOG_DATA) public data: CcmWorkDTO.GOPdata,
  ) {
    
  }
  
  // documentData: any = {};

  ngOnInit(): void {
  }

  onSubmit() {
    this.camundaService.completeUserTask(this.data.userTaskKey, {})
      .subscribe(response => {
        console.log('User task completed successfully:', response);
        this.dialogRef.close(true);
      }, error => {
        console.error('Error completing user task:', error);
        alert('Error completing user task. Please try again.');
      });
  }
  

  // Load the actual Allianz logo from assets
  private loadActualLogo(): void {
    this.http.get('/allianz-OG-logo.svg', { responseType: 'text' })
      .subscribe({
        next: (svgContent) => {
          // Convert SVG to base64
          const blob = new Blob([svgContent], { type: 'image/svg+xml' });
          const reader = new FileReader();
          reader.onload = () => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = 40;
              canvas.height = 40;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                // Draw the original image first
                ctx.drawImage(img, 0, 0, 40, 40);
                
                // Apply white color filter to make the logo white while preserving transparency
                const imageData = ctx.getImageData(0, 0, 40, 40);
                const data = imageData.data;
                
                for (let i = 0; i < data.length; i += 4) {
                  // If pixel is not transparent (has content)
                  if (data[i + 3] > 0) {
                    data[i] = 255;     // Red
                    data[i + 1] = 255; // Green
                    data[i + 2] = 255; // Blue
                    // Keep original alpha (data[i + 3]) for transparency
                  }
                }
                
                ctx.putImageData(imageData, 0, 0);
                this.logoBase64 = canvas.toDataURL('image/png');
              }
            };
            img.src = reader.result as string;
          };
          reader.readAsDataURL(blob);
        },
        error: (error) => {
          console.warn('Could not load logo from assets, using fallback:', error);
          // Fallback to simple logo if assets not found
          this.createFallbackLogo();
        }
      });
  }

  private createFallbackLogo(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#003876';
      ctx.beginPath();
      ctx.arc(20, 20, 18, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw white border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw white "A" symbol
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('A', 20, 20);
      
      this.logoBase64 = canvas.toDataURL('image/png');
    }
  }

  downloadPdf() {
    this.isDownloading = true;
    const promise = new Promise<void>((resolve, reject) => {
      this.loadActualLogo();
      resolve();
    });
    
    // Small delay to show loading state
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        
        doc.setFillColor(25, 118, 210);
        doc.rect(0, 0, 210, 35, 'F');
        
        // Header content
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('GOP Document', 20, 22);
        
        // Add logo 
        if (this.logoBase64) {
          doc.addImage(this.logoBase64, 'PNG', 170, 10, 12, 12);
        }
        doc.setFontSize(10);
        doc.text('Allianz', 185, 18);
        
        let yPos = 50;
        
        // Main card with proper styling
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(224, 224, 224);
        doc.setLineWidth(0.5);
        doc.rect(20, yPos, 170, 180, 'FD');
        
        // Card header
        doc.setFillColor(250, 250, 250);
        doc.rect(20, yPos, 170, 12, 'F');
        doc.setTextColor(25, 118, 210);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('GOP Document Details', 25, yPos + 8);
        
        yPos += 20;
        
        // Field data
        const fields = [
          { label: 'National ID', value: this.data.nationalId },
          { label: 'Pre Arrangement Number', value: this.data.preArrangementNumber },
          { label: 'GOP Number', value: this.data.gopNumber, highlight: true },
          { label: 'Policy Number', value: this.data.policyNumber, highlight: true },
          { label: 'Member Name', value: this.data.memberName },
          { label: 'Coverage Type', value: this.data.coverageType },
          { label: 'Approved Amount', value: this.data.approvedAmount, highlight: true },
          { label: 'Valid From', value: this.data.approvalDate },
          { label: 'Valid To', value: this.data.approvalValidTill }
        ];
        
        let leftColumn = true;
        const leftX = 30;
        const rightX = 105;
        const columnWidth = 70;
        const fieldHeight = 20;
        
        fields.forEach((field, index) => {
          const xPos = leftColumn ? leftX : rightX;
          
          // Label
          doc.setTextColor(117, 117, 117);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.text(field.label + ':', xPos, yPos);
          
          // Field value background
          if (field.highlight) {
            doc.setFillColor(187, 222, 251);
          } else {
            doc.setFillColor(245, 245, 245);
          }
          doc.rect(xPos, yPos + 2, columnWidth, 10, 'F');
          doc.setDrawColor(220, 220, 220);
          doc.setLineWidth(0.3);
          doc.rect(xPos, yPos + 2, columnWidth, 10, 'S');
          
          // Field value text
          if (field.highlight) {
            doc.setTextColor(25, 118, 210);
            doc.setFont('helvetica', 'bold');
          } else {
            doc.setTextColor(33, 33, 33);
            doc.setFont('helvetica', 'normal');
          }
          doc.setFontSize(9);
            doc.text(String(field.value ?? ''), xPos + 2, yPos + 8.5);
          
          // Alternate columns
          if (!leftColumn) {
            yPos += fieldHeight;
          }
          leftColumn = !leftColumn;
        });
        
        // Remarks field
        yPos += 10;
        doc.setTextColor(117, 117, 117);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('Remarks:', leftX, yPos);
        
        // Remarks background
        doc.setFillColor(245, 245, 245);
        doc.rect(leftX, yPos + 2, 145, 25, 'F');
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.rect(leftX, yPos + 2, 145, 25, 'S');
        
        // Remarks text
        doc.setTextColor(33, 33, 33);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const remarksLines = doc.splitTextToSize(this.data.remarks, 140);
        doc.text(remarksLines, leftX + 2, yPos + 8);
        
        // // Footer section
        // yPos += 50;
        // doc.setFillColor(255, 248, 220);
        // doc.rect(20, yPos, 170, 15, 'F');
        // doc.setDrawColor(220, 220, 220);
        // doc.rect(20, yPos, 170, 15, 'S');
        
        // doc.setTextColor(95, 95, 95);
        // doc.setFont('helvetica', 'italic');
        // doc.setFontSize(7);
        // doc.text('ℹ️  This document contains confidential information.', 25, yPos + 6);
        // doc.text('Please handle according to company policies.', 25, yPos + 11);
        
        // Generation timestamp
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 150, 150);
        const now = new Date().toLocaleString();
        doc.text(`Generated on: ${now}`, 20, 285);
        
        // Save the PDF
        const filename = `GOP_Document_.pdf`;
        doc.save(filename);
        
        console.log('PDF downloaded successfully');
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
      } finally {
        this.isDownloading = false;
      }
    }, 500);
  }

}

