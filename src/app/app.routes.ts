import { Routes } from '@angular/router';
import { TrainsComponent } from './trains/trains.component';
import { TicketComponent } from './ticket/ticket.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'ticket',
        pathMatch: 'full',
      },
      {
        path: 'ticket',
        component: TicketComponent,
      },
      {
        path: 'trains',
        component: TrainsComponent,
      }
];
