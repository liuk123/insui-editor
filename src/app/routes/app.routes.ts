import { Routes } from '@angular/router';
import { WebLayoutComponent } from './web-layout/web-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: WebLayoutComponent,
    children: [
      {
        path: 'editor-demo',
        loadChildren: () =>
          import('../../proj/editor-demo/editor-demo.routes').then(m => m.routes),
      },
      { path: '', redirectTo: 'editor-demo', pathMatch: 'full' },
    ]
  }
];
