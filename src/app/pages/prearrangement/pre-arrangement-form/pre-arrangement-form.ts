import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { searchApi } from '../../../../utils/searchService';
import { CamundaService } from '../../../../utils/camunda.service';
import { Icd10Service } from '../../../services/icd10.service';
import { FormControl } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { Icd9Service } from '../../../services/icd9.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pre-arrangement-form',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatOptionModule],
  templateUrl: './pre-arrangement-form.html',
  styleUrl: './pre-arrangement-form.css',
})
export class PreArrangementForm implements OnInit {

  form: FormGroup;
  departmentValue: 'IPD' | 'OPD' = 'IPD';
  taskname = '';
  userTaskKey = '';
  processInstanceKey = '';

  @Input() set department(value: 'IPD' | 'OPD') {
    if (value) this.onDepartmentChange(value);
  }
  @Output() formSubmitted = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private camundaService: CamundaService,
    private icdService: Icd10Service,
    private icd9Service: Icd9Service,
    private http: HttpClient
  ) {
    this.form = this.fb.group({
      nationalId: ['1234567890123'],
      policyNumber: [''],
      visitType: ['Accident', Validators.required],
      reservationType: ['Pre-arrangement', Validators.required],
     // hospitalName: ['', Validators.required],
      icd10: ['K35', Validators.required],
      icd9: [''],
      admissionDate: ['2025-11-01', Validators.required],
      accidentDate: ['2025-11-01', Validators.required],
    });
  }

  icdControl = new FormControl('');
  allCodes: any[] = [];
  filteredCodes!: Observable<any[]>;
  // ------------------- ICD-10 -------------------
  icd10Control = new FormControl('');
  icd10All: any[] = [];
  icd10Filtered: any[] = [];

  // ------------------- ICD-9 -------------------
  icd9Control = new FormControl('');
  icd9All: any[] = [];
  icd9Filtered: any[] = [];


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const dept = params['dept'];
      if (dept === 'IPD' || dept === 'OPD') {
        this.department = dept;
      }
    });
    this.camundaService.processIntanceKey$.subscribe(key => {
      if (key) {
        this.processInstanceKey = key;
      }
    });

     this.icdService.getCodes().subscribe(data => {
      this.allCodes = data;
      console.log('ICD-10 Codes loaded:', this.allCodes);

      this.filteredCodes = this.icdControl.valueChanges.pipe(
        startWith(''),
        map(value => this.filterCodes(value || ''))
      );
      console.log('Filtered Codes Observable set up');
    });

    /* -------- Load ICD-10 from public/icd10.json -------- */
    this.http.get<any[]>('/icd10.json').subscribe(data => {
      this.icd10All = data;

      this.icd10Control.valueChanges.subscribe(term => {
        const t = (term || '').toLowerCase();
        this.icd10Filtered = this.icd10All.filter(c =>
          c.code.toLowerCase().includes(t) ||
          c.description.toLowerCase().includes(t)
        );
      });
    });

    /* -------- Load ICD-9 from public/icd9.json -------- */
    this.http.get<any[]>('/icd9.json').subscribe(data => {
      this.icd9All = data;

      this.icd9Control.valueChanges.subscribe(term => {
        const t = (term || '').toLowerCase();
        this.icd9Filtered = this.icd9All.filter(c =>
          c.code.toLowerCase().includes(t) ||
          c.description.toLowerCase().includes(t)
        );
      });
    });

    
  }

 filterCodes(value: string): any[] {
    const filter = value.toLowerCase();
    return this.allCodes.filter(code =>
      code.code.toLowerCase().includes(filter) ||
      code.description.toLowerCase().includes(filter)
    );
  }
  onDepartmentChange(dept: 'IPD' | 'OPD') {
    this.departmentValue = dept;
    if (dept === 'IPD') {
      this.form.get('admissionDate')?.setValidators([Validators.required]);
      this.form.get('dischargeDate')?.setValidators([Validators.required]);
      this.form.get('visitDate')?.clearValidators();
      this.form.get('visitDate')?.setValue('');
    } else {
      this.form.get('visitDate')?.setValidators([Validators.required]);
      this.form.get('admissionDate')?.clearValidators();
      this.form.get('admissionDate')?.setValue('');
      this.form.get('dischargeDate')?.clearValidators();
      this.form.get('dischargeDate')?.setValue('');
    }

    this.form.get('admissionDate')?.updateValueAndValidity();
    this.form.get('dischargeDate')?.updateValueAndValidity();
    this.form.get('visitDate')?.updateValueAndValidity();
  }

  submitForm() {
    this.form.markAllAsTouched();
    this.taskname = 'Search Customer Info';

    if (this.form.valid) {
      console.log('Form Values:', this.form.value);

      const fv = this.form.value;
      const processDefinitionId = (searchApi as any)?.processDefinitionId || 'variable need to inserted';

      
      this.camundaService.getUserTaskByProcessInstance(this.processInstanceKey.split('.')[1])
        .subscribe({
          next: (res) => {
            this.userTaskKey = res.user_task_instances[0].id.split('.')[1];
            const variables = {
              customerInfo: {
                nationalId: fv.nationalId || '',
                policyNumber: fv.policyNumber || '',
              },
              visitInfo: {
                visitType: fv.visitType || '',
                reservationType: fv.reservationType || '',
         //       HospitalName: fv.hospitalName || '',
                ICD10: fv.icd10 || '',
                ICD9: fv.icd9 || '',
                admissionDate: fv.admissionDate || '',
                accidentDate: fv.accidentDate || '',
              },
              nationalIDSelected: false,
              policyNumberSelected: false,
              isPrevious: false
            }

            // Complete user task
            this.camundaService.completeUserTask(this.userTaskKey, variables).subscribe({
              next: () => {
                  this.formSubmitted.emit({
                    userTaskKey: this.userTaskKey,
                    processInstanceKey: this.processInstanceKey,
                   
                    variables
                  });
                  console.log('✅ Task completed and formSubmitted emitted');
              },
              error: (err) => {
                console.error('❌ Error completing task:', err);
              },
            });
          },
          error: (err) => {
            console.error('Error fetching user task:', err);
            //  this.message = 'Failed to fetch user task';
          }
        });
    } else {
      console.warn('⚠️ Form is invalid. Please check the required fields.');
    }

  }
}
