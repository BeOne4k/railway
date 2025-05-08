import { Routes } from '@angular/router';
import { TrainsComponent } from './trains/trains.component';
import { TicketComponent } from './ticket/ticket.component';
import { FormComponent } from './form/form.component';
import { FormCardComponent } from './form-card/form-card.component';
import { PdfComponent } from './pdf/pdf.component';

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
      },
      {
        path: 'form',
        component: FormComponent,
      },
      {
        path: 'form-card',
        component: FormCardComponent
      },
      {
        path: 'pdf',
        component: PdfComponent
      }
];
