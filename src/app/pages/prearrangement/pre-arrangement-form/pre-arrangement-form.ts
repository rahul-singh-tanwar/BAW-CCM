import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { searchApi } from '../../../../utils/searchService';
import { CamundaService } from '../../../../utils/camunda.service';

@Component({
  selector: 'app-pre-arrangement-form',
  imports: [CommonModule, ReactiveFormsModule],
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
    private camundaService: CamundaService
  ) {
    this.form = this.fb.group({
      nationalId: ['1234567890123'],
      policyNumber: [''],
      visitType: ['Sickness', Validators.required],
      reservationType: ['', Validators.required],
     // hospitalName: ['', Validators.required],
      icd10: ['A22', Validators.required],
      icd9: [''],
      admissionDate: ['', Validators.required],
      accidentDate: ['', Validators.required],
    });
  }


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
