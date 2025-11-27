import { Routes } from '@angular/router';
import { Prearrangement } from './pages/prearrangement/prearrangement';
import { TeamPerformance } from './pages/team-performance/team-performance';
import { ProcessPerformance } from './pages/process-performance/process-performance';
import { AdminConsole } from './pages/admin-console/admin-console';
import { PreArrangementForm } from './pages/prearrangement/pre-arrangement-form/pre-arrangement-form';
import { Login } from './pages/login/login';
import { ReviewPolicies } from './pages/prearrangement/review-policies/review-policies';
import { IframeView } from './pages/iframe-view/iframe-view'; 
import { UserTasksComponent } from './pages/prearrangement/user-tasks/user-tasks';
import { Layout } from './layout/layout';
import { AuthGuard } from '../utils/auth.guard';
import { CcmWorkQueue } from './pages/prearrangement/ccm-work-queue/ccm-work-queue';
import { Provider } from './pages/provider/provider';

export const routes: Routes = [
    // { path: '', redirectTo: 'login', pathMatch: 'full' },
    // { path: '', component: Layout },
    // { path: 'review-policies', component: ReviewPolicies },
    // { path: 'prearrangement', component: Prearrangement },
    // { path: 'team-performance', component: TeamPerformance },
    // { path: 'process-performance', component: ProcessPerformance },
    // { path: 'admin-console', component: AdminConsole },
    // { path: 'prearrangement/form', component: PreArrangementForm },
    //   { path: 'iframe', component: IframeView },
    // {path: 'login', component: Login},

    // Public route
    { path: 'login', component: Login },

    // Protected area with layout
    {
      path: '',
      component: Layout,
      canActivate: [AuthGuard],
      children: [
        { path: 'review-policies', component: ReviewPolicies },
        { path: 'prearrangement', component: Prearrangement },
        { path: 'team-performance', component: TeamPerformance },
        { path: 'process-performance', component: IframeView },
        { path: 'admin-console', component: AdminConsole },
        { path: 'prearrangement/form', component: PreArrangementForm },
        { path: 'iframe', component: IframeView },
        { path: 'user-tasks', component: UserTasksComponent },
        {path: 'ccm-work-queue', component: CcmWorkQueue },
        { path: 'provider', component: Provider }
      ]
    },

    // Unknown → redirect
    { path: '**', redirectTo: '' }

];
