import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ViewChild } from '@angular/core';
import { CamundaService } from '../../../../utils/camunda.service';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-ccm-work-queue',
  imports: [ CommonModule,
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
        MatIconModule,],
  templateUrl: './ccm-work-queue.html',
  styleUrl: './ccm-work-queue.css',
})
export class CcmWorkQueue {
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
        private camundaService: CamundaService
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

    /** ---------------------------
     *   🟦 WebSocket Setup
     * --------------------------- */
    initializeWebSocket() {
        this.camundaService.getAllUserTasks().subscribe({
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
               //     (!targetOwner || t.owner === targetOwner) &&
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

        this.camundaService.getUserTaskVariables(this.selectedTask.userTaskKey)
            .subscribe({
                next: (response: any) => {
                    console.log('✅ Fetched task variables:', response);
                    // const variables: any = {};
                    // if (response.items?.length) {
                    //     response.items.forEach((v: any) => (variables[v.name] = v.value));
                    // }
                    // this.taskVariables = variables;
                    // this.taskForm = this.buildFormGroup(this.taskVariables);
                },
                error: (err) => console.error('❌ Failed to fetch task variables', err),
            });
    }

    /** Build dynamic form */
    buildFormGroup(obj: any): FormGroup {
        const group: any = {};
        Object.keys(obj).forEach((key) => {
            const value = obj[key];
            if (Array.isArray(value)) {
                group[key] = this.fb.array(
                    value.map((v) => (this.isObject(v) ? this.buildFormGroup(v) : new FormControl(v)))
                );
            } else if (this.isObject(value)) {
                group[key] = this.buildFormGroup(value);
            } else {
                group[key] = new FormControl(value);
            }
        });
        return this.fb.group(group);
    }

    isObject(value: any): boolean {
        return value && typeof value === 'object' && !Array.isArray(value);
    }

    taskFormKeys(): string[] {
        return Object.keys(this.taskForm.controls);
    }

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
