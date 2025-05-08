import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import pdfMake from 'pdfmake/build/pdfmake';
import { vfs } from 'pdfmake/build/vfs_fonts';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface TicketData {
  id: string;
  phone: string;
  email: string;
  date: string;
  ticketPrice: number;
  trainID: number;
  confirmed: boolean;
  train: any;
  persons: {
    id: number;
    ticketId: string;
    seat: string | null;
    name: string;
    surname: string;
    idNumber: string;
    status: string;
    payoutCompleted: boolean;
  }[];
}

@Component({
  selector: 'app-pdf',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './pdf.component.html',
  styleUrl: './pdf.component.scss'
})
export class PdfComponent implements OnInit {
  pdfSrc: SafeResourceUrl | null = null;
  private pdfBlobUrl: string | null = null; // Для хранения небезопасного URL

  lastFourCardDigits: string | null = null;
  ticketNumber: string | null = null;
  ticketData: TicketData | null = null;
  loading: boolean = true;
  error: string = '';
  departureTime: string | null = null;
  arrivalTime: string | null = null;
  departureDate: string | null = null;
  fromLocation: string | null = null;
  toLocation: string | null = null;
  trainNumber: string | null = null;
  selectedSeatsInfo: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    (pdfMake as any).vfs = vfs;

    this.ticketNumber = this.route.snapshot.queryParamMap.get('ticket');
    this.departureTime = this.route.snapshot.queryParamMap.get('departureTime');
    this.arrivalTime = this.route.snapshot.queryParamMap.get('arrivalTime');
    this.departureDate = this.route.snapshot.queryParamMap.get('departureDate');
    this.fromLocation = this.route.snapshot.queryParamMap.get('fromLocation');
    this.toLocation = this.route.snapshot.queryParamMap.get('toLocation');
    this.trainNumber = this.route.snapshot.queryParamMap.get('trainNumber');
    this.lastFourCardDigits = this.route.snapshot.queryParamMap.get('lastFourCardDigits');

    const selectedSeatsParam = this.route.snapshot.queryParamMap.get('selectedSeats');
    this.selectedSeatsInfo = selectedSeatsParam ? JSON.parse(selectedSeatsParam) : [];

    if (this.ticketNumber) {
      this.loadTicketDetails(this.ticketNumber);
    } else {
      this.error = 'Ticket number not found in query parameters.';
      this.loading = false;
    }
  }

  loadTicketDetails(ticketId: string): void {
    const apiUrl = `https://railway.stepprojects.ge/api/tickets/confirm/${ticketId}`;
    this.http.get<TicketData>(apiUrl).subscribe({
      next: (data) => {
        this.ticketData = data;
        this.loading = false;
        this.generatePdf();
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load ticket details.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  generatePdf(): void {
    if (!this.ticketData) return;

    console.log('Generating PDF...');

    const documentDefinition = {
      content: [
        { text: 'Step Railway', style: 'logo' },
        {
          columns: [
            { text: `Ticket Code: ${this.ticketData.id}`, style: 'details' },
            { text: `Issue Date: 5-8-2025`, style: 'details', alignment: 'right' }
          ],
          margin: [0, 0, 0, 20]
        },
        {
          columns: [
            { text: 'Departure:', style: 'label' },
            { text: `${this.fromLocation} at ${this.departureTime}`, style: 'location' },
            { text: 'Arrival:', style: 'label', alignment: 'right' },
            { text: `${this.toLocation} at ${this.arrivalTime}`, style: 'location', alignment: 'right' }
          ],
          margin: [0, 0, 0, 10]
        },
        { text: 'Departure Date:', style: 'label' },
        { text: this.ticketData.date, style: 'value', margin: [0, 0, 0, 10] },
        { text: 'Contact Information:', style: 'label' },
        {
          columns: [
            { text: `Email: ${this.ticketData.email}`, style: 'infoRow' },
            { text: `Phone: ${this.ticketData.phone}`, style: 'infoRow', alignment: 'right' }
          ],
          margin: [0, 0, 0, 20]
        },
        { text: 'Passengers', style: 'passengerLabel' },
        this.ticketData.persons.map((person, index) => ({
          columns: [
            { text: `Name: ${person.name}`, style: 'passengerInfo' },
            { text: `Surname: ${person.surname}`, style: 'passengerInfo' },
            { text: `ID Number: ${person.idNumber}`, style: 'passengerInfo' },
            {
              text: `Seat: ${
                this.selectedSeatsInfo[index]?.seat
                  ? this.selectedSeatsInfo[index].seat.slice(0, -1) +
                    this.selectedSeatsInfo[index].seat.slice(-1)
                  : '-'
              }`,
              style: 'passengerInfo'
            },
            {
              text: `Vagon №: ${
                this.selectedSeatsInfo[index]?.vagonIndex !== null
                  ? this.selectedSeatsInfo[index].vagonIndex + 1
                  : '-'
              }`,
              style: 'passengerInfo'
            }
          ],
          margin: [0, 0, 0, 5]
        })),
        { text: 'Payment info:', style: 'paymentLabel', margin: [0, 15, 0, 5] },
        { text: `Credit Card - **** **** **** ${this.lastFourCardDigits}`, style: 'paymentDetails' },
        {
          columns: [
            { text: 'Total Paid', style: 'totalLabel' },
            { text: `${this.ticketData.ticketPrice} ₾`, style: 'totalPrice', alignment: 'right' }
          ],
          margin: [0, 15, 0, 10]
        },
        { text: 'Information is computer-generated and valid without print and signature.', style: 'disclaimer' },
        { text: 'Please check your data to identify the ticket number.', style: 'disclaimerBold' }
      ],
      styles: {
        logo: {
          fontSize: 1.5 * 14, 
          bold: true,
          color: '#333',
          margin: [0, 0, 0, 10]
        },
        details: {
          fontSize: 14,
          color: '#333'
        },
        label: {
          color: '#777',
          fontSize: 14
        },
        location: {
          fontSize: 1.1 * 14,
          bold: true
        },
        value: {
          fontSize: 1.1 * 14,
          bold: true
        },
        infoRow: {
          fontSize: 14
        },
        passengerLabel: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        passengerInfo: {
          fontSize: 14
        },
        paymentLabel: {
          fontSize: 14,
          bold: true
        },
        paymentDetails: {
          fontSize: 14
        },
        totalLabel: {
          fontSize: 1.1 * 14,
          bold: true
        },
        totalPrice: {
          fontSize: 1.8 * 14,
          bold: true,
          color: '#2840BF'
        },
        disclaimer: {
          color: '#777',
          fontSize: 0.9 * 14,
          alignment: 'center',
          margin: [0, 10, 0, 5]
        },
        disclaimerBold: {
          color: 'red',
          fontSize: 0.9 * 14,
          bold: true,
          alignment: 'center'
        }
      },
      defaultStyle: {
        fontSize: 14,
        font: 'Roboto'
      },
      pageMargins: [40, 60, 40, 60]
    };

    (pdfMake as any).createPdf(documentDefinition).getBlob((blob: Blob) => {
      this.pdfBlobUrl = URL.createObjectURL(blob);
      this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfBlobUrl);
      console.log('PDF URL:', this.pdfSrc);
      this.cdr.detectChanges();
    });
  }

  downloadPdf(): void {
    if (this.pdfBlobUrl) {
      const link = document.createElement('a');
      link.href = this.pdfBlobUrl;
      link.download = 'ticket.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  addRipple(event: MouseEvent) {
    const button = event.currentTarget as HTMLElement;
    button.classList.add('ripple');

    setTimeout(() => {
      button.classList.remove('ripple');
    }, 520);
  }
}