import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgIf, NgFor } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';


@Component({
  selector: 'app-delete-ticket',
  templateUrl: './delete-ticket.component.html',
  styleUrl: './delete-ticket.component.scss',
  standalone: true,
  imports: [HttpClientModule, NgIf, NgFor],
})
export class DeleteTicketComponent {
  ticketData: any;
  errorMessage: string = '';
  logoUrl: string = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQliJsyFLWC1G6BBX5W3_fRhGtlfNuS-UtdRg&s';

  constructor(private http: HttpClient, private changeDetectorRef: ChangeDetectorRef) { }

  successMessage: string = '';


  addRipple(event: MouseEvent) {
    const button = event.currentTarget as HTMLElement;
    button.classList.add('ripple');
    setTimeout(() => {
      button.classList.remove('ripple');
    }, 520);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1; // Месяцы в JavaScript начинаются с 0
      const year = date.getFullYear();

      // Добавляем ведущие нули, если необходимо
      const formattedDay = day < 10 ? `0${day}` : `${day}`;
      const formattedMonth = month < 10 ? `0${month}` : `${month}`;

      return `${formattedDay}-${formattedMonth}-${year}`;
    } catch (error) {
      console.error('Error parsing date:', error);
      return dateString;
    }
  }

checkTicket(ticketId: string) {

    this.successMessage = '';

  if (!ticketId) {
    this.errorMessage = 'Please enter a ticket number.';
    this.ticketData = null;
    return;
  }

  const apiUrl = `https://railway.stepprojects.ge/api/tickets/checkstatus/${ticketId}`;

  this.http.get<{ persons: any[] }>(apiUrl).subscribe({
    next: (data) => {
      const requests = data.persons.map((person: any) => {
        const vagonId = person?.seat?.vagonId;
        if (!vagonId) return of(null);
        return this.http
          .get<{ name: string }>(`https://railway.stepprojects.ge/api/getvagon/${vagonId}`)
          .pipe(
            catchError(() => of(null)),
            map((vagonData) => ({ person, vagonName: vagonData?.name || '-' }))
          );
      });

      forkJoin(requests).subscribe((results) => {
        results.forEach((res) => {
          if (res && res.person?.seat) {
            res.person.seat.vagonName = res.vagonName;
            console.log(`Vagon name for person ${res.person.firstName || ''} ${res.person.lastName || ''}:`, res.vagonName);
          }
        });

        this.ticketData = data;
        this.errorMessage = '';
      });
    },
    error: (error) => {
      console.error('Error fetching ticket:', error);
      this.ticketData = null;
      this.errorMessage =
        error.status === 404
          ? 'Ticket not found.'
          : 'Failed to fetch ticket information. Please check your ticket id.';
    },
  });
}

cancelTicketById() {
  if (!this.ticketData?.id) {
    this.errorMessage = 'No ticket to cancel.';
    this.successMessage = '';
    this.changeDetectorRef.detectChanges();
    return;
  }

  const apiUrl = `https://railway.stepprojects.ge/api/tickets/cancel/${this.ticketData.id}`;

  this.http.delete(apiUrl, { responseType: 'text' }).subscribe({
    next: (responseText) => {
      console.log('Response text:', responseText);
      this.ticketData = null;
      this.successMessage = 'Ticket has been successfully canceled. Refund will be processed within 24 hours.';
      this.errorMessage = '';
      this.changeDetectorRef.detectChanges();
    },
    error: (error) => {
      console.error('Error canceling ticket:', error);
      this.errorMessage = 'Failed to cancel the ticket. Please try again.';
      this.successMessage = '';
      this.changeDetectorRef.detectChanges();
    }
  });
}

}