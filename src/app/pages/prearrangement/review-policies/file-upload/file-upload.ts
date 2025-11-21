import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { CamundaService } from '../../../../../utils/camunda.service';

interface FileUploadItem {
  file: File;
  uploading: boolean;
  uploaded: boolean;
  serverData?: any; // metadata returned from backend
}

interface UploadedFileResponse {
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
}


@Component({
  selector: 'app-file-upload',
  imports: [MatIcon, CommonModule],
  templateUrl: './file-upload.html',
  styleUrls: ['./file-upload.css'],
})
export class FileUpload {

  @Input() title!: string;
  files: FileUploadItem[] = [];

  constructor(private camundaService: CamundaService) {}

  // Called when user selects files
   onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement | null;
    const fileList = input?.files ?? [];
    const selectedFiles = Array.from(fileList) as File[];

    selectedFiles.forEach(file => {
      const fileItem: FileUploadItem = {
        file,
        uploading: true,
        uploaded: false,
      };

      this.files.push(fileItem);

      // Upload each file individually
      this.camundaService.uploadFiles([file]).subscribe({
        next: (response) => {
          fileItem.uploading = false;
          fileItem.uploaded = true;
          fileItem.serverData = response.files?.[0];
        },
        error: (err) => {
          console.error('Error uploading file:', err);
          fileItem.uploading = false;
        }
      });
    });
  }

  // Remove a file from list
  removeFile(index: number) {
    this.files.splice(index, 1);
  }

  // New method: get current files
  getFiles(): UploadedFileResponse[] {
     return this.files
    .filter(f => f.uploaded && f.serverData)
    .map(f => f.serverData!) as UploadedFileResponse[];
  }
}
