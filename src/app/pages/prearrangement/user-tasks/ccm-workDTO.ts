export interface Benefit {
  name: string;
  limit: string;
  remarks?: string;
}

export interface PolicyEntry {
  benefits?: Benefit[];
}

export interface selectedPackage {
    Name: String;
    icdMatch: String;
    network:  String;
    simbMatch: number;
    packagePrice: number;
    standardTariff: number;
}

export interface UploadedDoc {
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface UploadedFilesCategories {
  formFiles?: UploadedDoc[];
  labFiles?: UploadedDoc[];
  otherFiles?: UploadedDoc[];
}

export interface CustomerInfo {
  nationalId: string;
  policyNumber: string;
}

export interface VisitInfo {
  visitType?: string;
  reservationType?: string;
  ICD10?: string;
  ICD9?: string;
  AdmissionDate?: string;
  AccidentDate?: string;
}

export interface ReadonlyPopupData {
  userTaskKey?: string;
  eligiblePolicies?: Array<{
    companyName: string;
    policyType: string;
    policyNumber: string;
    effectiveDate?: string;
    expiryDate?: string;
  }>;
  benefits?: Benefit[]; // table of benefit entries (as provided in the prompt)
  uploadedDocuments?: UploadedFilesCategories;
  customerInfo?: CustomerInfo;
  visitInfo?: VisitInfo;
  prearengment?: string;
  physicianLicenceNumber?: string;
  silbmAmount?: string;
  lengthOfStay?: number;
  averageCost?: number;
  diseaseDetails?: string;
  selectedPackage?: selectedPackage;
}

export interface GOPdata {
  userTaskKey: string;
  nationalId: string;
  preArrangementNumber: string;
  gopNumber: string; 
  memberName: string;
  coverageType: string;
  policyNumber: string;
  approvedAmount: number;
  approvalDate: string;
  approvalValidTill: string;
  remarks: string;
} 