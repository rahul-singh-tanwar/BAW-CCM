import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { GopDocument } from '../../gop-document/gop-document';
// import { CamundaFormComponent } from '../../../services/camunda-form.component';
import { Router } from '@angular/router';
import { CamundaService } from '../../../../utils/camunda.service';
import * as CcmWorkDTO from './ccm-workDTO';
import { CcmWorkQueue } from './ccm-work-queue/ccm-work-queue';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
    selector: 'app-user-tasks',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatToolbarModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatChipsModule,
        MatIconModule,
        CcmWorkQueue,
        MatDialogModule
    ],
    templateUrl: './user-tasks.html',
    styleUrls: ['./user-tasks.scss'],
})
export class UserTasksComponent implements OnInit, OnDestroy {
    private ws!: WebSocket;
    private tasksSubscription: any;

    tasks: any[] = [];
    filteredTasks: any[] = [];
    processNames: string[] = [];
    dataSource = new MatTableDataSource<any>([]);
    taskForm!: FormGroup;

    filters = {
        state: '',
        processName: '',
        priority: '',
        tenantId: '',
        name: '',
    };

    possibleStates = [
        'CREATING', 'CREATED', 'ASSIGNING', 'UPDATING', 'COMPLETING',
        'COMPLETED', 'CANCELING', 'CANCELED', 'FAILED',
    ];

    displayedColumns: string[] = [
        'userTaskKey', 'name', 'assignee', 'creationDate', 'state', 'preArrangNumber', 'priority'
    ];

    selectedTask: any = null;
    taskVariables: any = {};
    variableKeys: string[] = [];
    collapsedKeys: Set<string> = new Set();

    private wsUrl = 'ws://localhost:3001';
    private camundaBaseUrl = 'http://localhost:8080/v2';
    private baseUrl = 'http://localhost:3000';

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private http: HttpClient,
        private fb: FormBuilder,
        private router: Router,
        private camundaService: CamundaService,
        public dialog: MatDialog
    ) {
        this.taskForm = this.fb.group({});
    }

    ngOnInit(): void {
        this.initializeWebSocket();
    }

    ngOnDestroy(): void {
        if (this.ws) this.ws.close();
        if (this.tasksSubscription) this.tasksSubscription.unsubscribe();
    }

     initializeWebSocket() {
        this.camundaService.getUserTasks().subscribe({
            next: (response) => {
                console.log('✅ Fetched tasks:', this.tasks);
                 this.tasks = response.user_task_instances || [];

                // 🟦 Example filters
                const targetOwner = localStorage.getItem('username');  // dynamic or fixed
                //const targetName = "CCM Work Queue Task"; // dynamic or fixed

                let targetName: string;
                if ( targetOwner == 'HospNetTeamMember1' || targetOwner == 'HospNetTeamMember2' ) {
                   targetName = "Download GOP";
                }else{  
                     targetName = "CCM Work Queue Task";
                }
                
                this.tasks = this.tasks.filter(t =>
                    (!targetOwner || t.owner === targetOwner) &&
                    (!targetName || t.name === targetName)
                );
                console.log('✅ Fetched tasks:', this.tasks);

                this.tasks = this.tasks.map(t => {
                    // Map owner → assignee
                    t.assignee = t.owner;
                    t.creationDate = t.start_time;
                    t.userTaskKey = t.id.split('.')[1];

                    // Extract part after "CCM Work Queue "
                    t.preArrangNumber = t.display_name?.split("CCM Work Queue ")[1]?.trim() || t.display_name?.split("Download GOP ")[1]?.trim() ||"-";

                    return t;
                });

               
                this.processNames = [...new Set(this.tasks.map(t => t.processName).filter(Boolean))];
                this.applyFilters();
            },
            error: (err) => console.error('❌ Failed to fetch tasks', err),
        });


    }

    openGopDocument(taskVariables: any[]) {
        const varsMap = this.variablesToMap(taskVariables);
        console.log("Mapped Variables for GOP Document:", varsMap);

        const formatDate = (value: any): string => {
            if (!value) return '';
            const d = new Date(value);
            if (isNaN(d.getTime())) return '';
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}-${month}-${year}`;
        };

        const gopData: CcmWorkDTO.GOPdata = {
            userTaskKey: this.selectedTask.userTaskKey || '',
            nationalId: varsMap.customerInfo.nationalId || '',
            preArrangementNumber: varsMap.preArrangementNo || '',
            gopNumber: varsMap.gopNumber || 'GOP-' + Date.now(),
            policyNumber: varsMap.selectedPolicyNumber || '',
            memberName: varsMap.memberName || 'Rahul Singh Tanwar',
            coverageType: varsMap.coverageType || 'Inpatient',
            approvedAmount: varsMap.simbAmount || '0',
            approvalDate: formatDate(varsMap.approvalDate || Date.now()),
            approvalValidTill: formatDate(varsMap.approvalValidTill || (Date.now() + 30 * 24 * 60 * 60 * 1000 * 11)),
            remarks: varsMap.remarks || 'Approved as per inpatient benefit rules'
        };

     
        const dialogRef = this.dialog.open(GopDocument, {
            width: "80vw",
            height: "80vh",
            maxHeight: "100vh",
            maxWidth: '90vw',
            panelClass: "gop-document-dialog",
            data: gopData
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log("GOP Document dialog closed:", result);
        });
    }


    openCcmWorkQueue(taskVariables: any[]) {
        // Convert variables array into a key-value map
        const varsMap = this.variablesToMap(taskVariables);
        console.log("Mapped Variables:", varsMap);

        // Extract eligibility results safely
        const eligibilityResults = varsMap.eligibilityResults || {};

        // Build eligiblePolicies
        const eligiblePolicies = [{
            companyName: eligibilityResults.companyName,
            policyType: eligibilityResults.policyType,
            policyNumber: eligibilityResults.policyNumber,
            effectiveDate: eligibilityResults.effectiveDate,
            expiryDate: eligibilityResults.expiryDate
        }];

        // Build benefits structure
        const selectedPolicyNumber = varsMap.selectedPolicyNumber;

        const benefits = eligibilityResults.benefits.items.map((b: any) => ({
            name: b.name,
            limit: b.limit,
            remarks: b.remarks,
        }));
 

        // Prepare the dialog data to match CcmWorkDTO.ReadonlyPopupData
        const dialogData: CcmWorkDTO.ReadonlyPopupData = {
            userTaskKey: this.selectedTask.userTaskKey || '',
            eligiblePolicies,
            benefits,

            uploadedDocuments: {
                formFiles: varsMap.uploadFiles?.formFiles || [],
                labFiles: varsMap.uploadFiles?.labFiles || [],
                otherFiles: varsMap.uploadFiles?.otherFiles || []
            },

            customerInfo: {
                nationalId: varsMap.customerInfo?.nationalId || "",
                policyNumber: varsMap.customerInfo?.policyNumber || ""
            },

            visitInfo: {
                visitType: varsMap.visitInfo?.visitType || "",
                reservationType: varsMap.visitInfo?.reservationType || "",
                ICD10: varsMap.visitInfo?.ICD10 || "",
                ICD9: varsMap.visitInfo?.ICD9 || "",
                AdmissionDate: varsMap.visitInfo?.admissionDate || "",
                AccidentDate: varsMap.visitInfo?.accidentDate || ""
            },

            prearengment: varsMap.preArrangNumber || "",
            physicianLicenceNumber:
                varsMap.physicianNumber || varsMap.physicianLicense || "",
            silbmAmount: varsMap.simbAmount || "",
            lengthOfStay: varsMap.lengthOfStay || 0,
            averageCost: varsMap.averageCost || 0,
            diseaseDetails: varsMap.diseaseDetails || "",
            selectedPackage: varsMap.selectedPackage || undefined
        };

        const dialogRef = this.dialog.open(CcmWorkQueue, {
            width: "80vw",        // adjust as needed
            height: "80vh",      // full height only
            maxHeight: "100vh",
            maxWidth: '90vw',
            panelClass: "workqueue-dialog",
            data: dialogData
        });

        dialogRef.afterClosed().subscribe((result) => {
            console.log("Dialog closed:", result);
        });
    }

    // Converts variables [{name: '', value: ''}] → { name: value }
    private variablesToMap(variables: any[]): any {
        console.log("Converting variables array to map:", variables);
        const map: any = {};

        variables.forEach((v) => {
            map[v.name] = v.data;
        });

        return map;
    }



   

    async refreshTasks() {
        const username = localStorage.getItem('username') ?? 'demo';

        const payload = {
            filter: { assignee: username, state: this.filters.state || 'CREATED' },
            page: { from: 0, limit: 100 }
        };

        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

        this.tasksSubscription = this.http.post<any>(
            `${this.baseUrl}/user-tasks/searchbyUser`,
            payload,
            headers ? { headers } : undefined
        ).subscribe({
            next: async (response) => {
                const tasks = response.items || [];

                // 🟦 Fetch variables for each task & attach "preArrangNumber"
                for (const task of tasks) {
                    try {
                        const vars: any = await this.http
                            .post(`${this.baseUrl}/user-tasks/${task.userTaskKey}/variables`, {})
                            .toPromise();

                        if (vars.items?.length) {
                            const variableMap: any = {};
                            vars.items.forEach((v: any) => variableMap[v.name] = v.value);

                            task.preArrangNumber = variableMap["preArrangNumber"] ?? null;  // <-- ★ Attach to task
                        } else {
                            task.preArrangNumber = null;
                        }
                    } catch (err) {
                        console.error(`Failed fetching variables for task ${task.userTaskKey}`, err);
                        task.preArrangNumber = null;
                    }
                }

                this.tasks = tasks;

                // Build dropdown of process names
                this.processNames = [...new Set(this.tasks.map((t) => t.processName).filter(Boolean))];

                this.applyFilters();
            },
            error: (err) => console.error('❌ Failed to fetch tasks', err),
        });
    }

    /** Navigate */
    goToUploadFiles() {
        this.router.navigate(['/document-upload']);
    }

    /** ---------------------------
     *   🟦 Task Variable Fetch (HTTP)
     * --------------------------- */
    selectTask(task: any, event: Event) {
        event.preventDefault();
        this.selectedTask = task;

        this.camundaService.getUserTaskData(this.selectedTask.userTaskKey)
            .subscribe({
                next: (response: any) => {

                   if (task.name === 'CCM Work Queue Task') {
                        this.openCcmWorkQueue(response.output);
                        return;
                   }
                    else {
                        this.openGopDocument(response.output);
                        return;
                        // this.dialog.open(GopDocument, {
                        //     width: '90vw',
                        //     height: '90vh',
                        //     maxWidth: '90vw',
                        //     maxHeight: '90vh',
                        //     panelClass: "workqueue-dialog",
                        //     data: { task: this.selectedTask }
                        // });
                    }
                },
                error: (err) => console.error('❌ Failed to fetch task variables', err),
            });
    }

    // openccmWorkQueue() {
    //     this.router.navigate(['/ccm-work-queue']);
    // }


    /** ---------------------------
     *   🟦 Table Filtering
     * --------------------------- */
    /*
    applyFilters(): void {
        this.filteredTasks = this.tasks.filter(task => {
            return (!this.filters.state || task.state === this.filters.state) &&
                (!this.filters.processName || task.processName === this.filters.processName) &&
                (!this.filters.priority || task.priority === +this.filters.priority) &&
                (!this.filters.name || task.name === this.filters.name) &&
                (!this.filters.tenantId || task.tenantId === this.filters.tenantId);
        });

        this.dataSource = new MatTableDataSource(this.filteredTasks);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }*/

    applyFilters(): void {
        const username = localStorage.getItem('username') ?? 'demo';

        this.filteredTasks = this.tasks.filter(task => {

            // 🟥 ROLE-BASED FILTER FOR DEMO USER
            if (username === 'demo') {
                return task.name === 'Download GOP';
            }

            // 🟦 Existing filters for all other users
            return (!this.filters.state || task.state === this.filters.state) &&
                (!this.filters.processName || task.processName === this.filters.processName) &&
                (!this.filters.priority || task.priority === +this.filters.priority) &&
                (!this.filters.name || task.name === this.filters.name) &&
                (!this.filters.tenantId || task.tenantId === this.filters.tenantId);
        });

        this.dataSource = new MatTableDataSource(this.filteredTasks);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }


    getStateClass(state: string): string {
        switch (state) {
            case 'CREATED': return 'chip-created';
            case 'COMPLETED': return 'chip-completed';
            case 'FAILED': return 'chip-failed';
            case 'CANCELED': return 'chip-canceled';
            default: return 'chip-default';
        }
    }

    /** ---------------------------
     *   🟦 Complete Task
     * --------------------------- */
    completeTask() {
        if (!this.selectedTask) return;

        const updatedVariables: any = {};
        Object.keys(this.taskForm.controls).forEach(key => {
            updatedVariables[key] = this.taskForm.controls[key].value;
        });

        this.http.post(
            `${this.camundaBaseUrl}/user-tasks/${this.selectedTask.userTaskKey}/completion`,
            { variables: updatedVariables }
        )
            .subscribe({
                next: () => {
                    alert('✅ Task completed successfully!');
                    this.selectedTask = null;
                    this.taskVariables = {};
                    this.taskForm.reset();
                },
                error: (err) => console.error('❌ Failed to complete task', err),
            });
    }
}
