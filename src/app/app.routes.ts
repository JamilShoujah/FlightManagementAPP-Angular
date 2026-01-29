import { Routes } from '@angular/router';
import { ViewFlights } from './pages/view-flights/view-flights';
import { ViewOrders } from './pages/view-orders/view-orders';
import { LandingPage } from './pages/landing-page/landing-page';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'flights', component: ViewFlights },
  { path: 'orders', component: ViewOrders },
];
