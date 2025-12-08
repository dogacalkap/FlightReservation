import { Routes } from '@angular/router';

export default [
  {
    path: 'business-class',
    loadComponent: () =>
      import('./business-class/business-class.component')
        .then(c => c.BusinessClassComponent)
  },
  {
    path: 'economy-class',
    loadComponent: () =>
      import('./economy-class/economy-class.component')
        .then(c => c.EconomyClassComponent)
  },
  {
    path: 'catering',
    loadComponent: () =>
      import('./catering/catering.component')
        .then(c => c.CateringComponent)
  },
  {
    path: 'entertainment',
    loadComponent: () =>
      import('./entertainment/entertainment.component')
        .then(c => c.EntertainmentComponent)
  },
  {
    path: 'lounge',
    loadComponent: () =>
      import('./lounge/lounge.component')
        .then(c => c.LoungeComponent)
  }
] as Routes;
