import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { authGuard } from './core/guards/auth.guard';
import { pendingApprovalGuard } from './core/guards/pending-approval.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard, pendingApprovalGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'projects',
        loadComponent: () => import('./features/projects/projects-list.component').then(m => m.ProjectsListComponent)
      },
      {
        path: 'projects/:id',
        loadComponent: () => import('./features/projects/project-detail.component').then(m => m.ProjectDetailComponent)
      },
      {
        path: 'tasks',
        loadComponent: () => import('./features/tasks/tasks.component').then(m => m.TasksComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent)
      },
      {
        path: 'time-tracker',
        loadComponent: () => import('./features/time-tracker/time-tracker.component').then(m => m.TimeTrackerComponent)
      },
      {
        path: 'hr/leaves',
        loadComponent: () => import('./features/hr/leave-request.component').then(m => m.LeaveRequestComponent)
      },
      {
        path: 'hr/approvals',
        loadComponent: () => import('./features/hr/leave-approval.component').then(m => m.LeaveApprovalComponent)
      },
      {
        path: 'hr/expenses',
        loadComponent: () => import('./features/hr/expense-claims.component').then(m => m.ExpenseClaimsComponent)
      },
      {
        path: 'hr/expense-approvals',
        loadComponent: () => import('./features/hr/expense-approvals.component').then(m => m.ExpenseApprovalsComponent)
      },
      {
        path: 'settings/organization',
        loadComponent: () => import('./features/settings/organization-settings.component').then(m => m.OrganizationSettingsComponent)
      },
      {
        path: 'settings/team',
        loadComponent: () => import('./features/settings/team.component').then(m => m.TeamSettingsComponent)
      },
      {
        path: 'settings/screenshots',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/settings/screenshot-viewer.component').then(m => m.ScreenshotViewerComponent)
      },
      {
        path: 'settings/screenshots/:userId',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/settings/screenshot-detail.component').then(m => m.ScreenshotDetailComponent)
      },
      {
        path: 'settings/screenshot-settings',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/settings/screenshot-settings.component').then(m => m.ScreenshotSettingsComponent)
      }
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'pending-approval',
    loadComponent: () => import('./features/auth/pending-approval.component').then(m => m.PendingApprovalComponent)
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./features/onboarding/onboarding.component').then(m => m.OnboardingComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'login' }
];
