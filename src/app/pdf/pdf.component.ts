import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';


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

  constructor(private route: ActivatedRoute, private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.ticketNumber = this.route.snapshot.queryParamMap.get('ticket');
    this.departureTime = this.route.snapshot.queryParamMap.get('departureTime');
    this.arrivalTime = this.route.snapshot.queryParamMap.get('arrivalTime');
    this.departureDate = this.route.snapshot.queryParamMap.get('departureDate');
    this.fromLocation = this.route.snapshot.queryParamMap.get('fromLocation');
    this.toLocation = this.route.snapshot.queryParamMap.get('toLocation');
    this.trainNumber = this.route.snapshot.queryParamMap.get('trainNumber');

    const lastFourCardDigitsParam = this.route.snapshot.queryParamMap.get('lastFourCardDigits'); // <---- ОБЪЯВИТЕ И ИНИЦИАЛИЗИРУЙТЕ ПЕРЕМЕННУЮ
    this.lastFourCardDigits = lastFourCardDigitsParam;

    console.log('Last Four Card Digits in PdfComponent:', this.lastFourCardDigits);

    const selectedSeatsParam = this.route.snapshot.queryParamMap.get('selectedSeats');
    console.log('selectedSeatsParam in PdfComponent:', selectedSeatsParam);
    this.selectedSeatsInfo = selectedSeatsParam ? JSON.parse(selectedSeatsParam) : [];
    console.log('Selected Seats in PdfComponent:', this.selectedSeatsInfo);

    console.log('Departure Time:', this.departureTime);
    console.log('Arrival Time:', this.arrivalTime);
    console.log('Departure Date:', this.departureDate);
    console.log('From Location:', this.fromLocation);
    console.log('To Location:', this.toLocation);
    console.log('Train Number:', this.trainNumber);

    if (this.ticketNumber) {
      console.log('Received Ticket Number:', this.ticketNumber);
      this.loadTicketDetails(this.ticketNumber);
    } else {
      this.error = 'Ticket number not found in query parameters.';
      this.loading = false;
      console.error(this.error);
    }

    this.cdr.detectChanges();
  }

  loadTicketDetails(ticketId: string): void {
    const apiUrl = `https://railway.stepprojects.ge/api/tickets/confirm/${ticketId}`;
    this.http.get<TicketData>(apiUrl).subscribe({
      next: (data) => {
        this.ticketData = data;
        this.loading = false;
        console.log('Ticket Data:', this.ticketData);
        console.log('Ticket Data in Template:', this.ticketData);
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = 'Failed to load ticket details.';
        this.loading = false;
        console.error(this.error, error);
      }
    });
  }
}