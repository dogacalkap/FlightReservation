import { Routes } from '@angular/router';

// ADMIN
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { LayoutComponent } from './admin/layout/layout.component';
import { AirportsComponent } from './airports/airports.component';
import { FlightsComponent } from './flights/flights.component';
import { adminAuthGuard } from './admin/auth/admin-auth.guard';

// CUSTOMER
import { LandingComponent } from './landing/landing.component';
import { CustomerHomeComponent } from './customer/home/home.component';
import { LoginComponent } from './auth/login/login.component';

export const routes: Routes = [

  // DEFAULT
  { path: '', redirectTo: 'landing', pathMatch: 'full' },

  // PUBLIC
  { path: 'landing', component: LandingComponent },
  { path: 'customer/login', component: LoginComponent },

  // CUSTOMER
{
  path: 'customer',
  children: [
    { path: '', redirectTo: 'seat-availability', pathMatch: 'full' },
    { path: 'seat-availability', component: CustomerHomeComponent, data: { step: 'seatAvailability' } },
    { path: 'passenger-info', component: CustomerHomeComponent, data: { step: 'passengerInfo' } },
    { path: 'seat-selection', component: CustomerHomeComponent, data: { step: 'seatSelection' } },
    { path: 'baggage', component: CustomerHomeComponent, data: { step: 'baggage' } },
    { path: 'extras', component: CustomerHomeComponent, data: { step: 'extras' } },
    { path: 'payment', component: CustomerHomeComponent, data: { step: 'payment' } },
    {
      path: 'my-flights',
      loadComponent: () =>
        import('./customer/my-flights/my-flights.component')
          .then(c => c.MyFlightsComponent)
    }
  ]
},


  // ADMIN LOGIN
  { path: 'login', component: AdminLoginComponent },

  // -------------------------
  // ⭐ CORRECT ADMIN SECTION
  // -------------------------
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [adminAuthGuard],
    children: [
      { path: 'airports', component: AirportsComponent },
      { path: 'flights', component: FlightsComponent },
      {
        path: 'users',
        loadComponent: () =>
        import('./admin/users/admin-users.component')
        .then(m => m.AdminUsersComponent)
    },

      {
        path: 'messages',
        loadComponent: () =>
          import('./admin/messages/messages.component')
            .then(c => c.MessagesComponent)
      },
      { path: '', redirectTo: 'airports', pathMatch: 'full' }
    ]
  },

  // EXPERIENCE / ABOUT / CONTACT / OFFERS
  {
    path: 'experience',
    loadChildren: () => import('./experience/experience.routes')
  },
  {
    path: 'offers',
    loadComponent: () =>
      import('./offers/offers.component').then(c => c.OffersComponent)
  },
  {
    path: 'offers/winter-discount',
    loadComponent: () =>
      import('./offers/winter-discount/winter-discount.component')
        .then(c => c.WinterDiscountComponent)
  },
  {
    path: 'offers/business-class',
    loadComponent: () =>
      import('./offers/business-class-offer/business-class-offer.component')
        .then(c => c.BusinessClassOfferComponent)
  },
  {
    path: 'offers/student-discount',
    loadComponent: () =>
      import('./offers/student-discount/student-discount.component')
        .then(c => c.StudentDiscountComponent)
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./about/about.component').then(c => c.AboutComponent)
  },
  {
    path: 'about-details',
    loadComponent: () =>
      import('./about/about-details/about-details.component')
        .then(c => c.AboutDetailsComponent)
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./contact/contact.component').then(c => c.ContactComponent)
  },

  // NOT FOUND
  { path: '**', redirectTo: 'landing' }
];
