import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

  @ViewChild('ticketContainer') ticketContainerRef!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  ngOnInit(): void {
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
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load ticket details.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  printPdf(): void {
    const elementToCapture = this.ticketContainerRef.nativeElement;

    html2canvas(elementToCapture).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // Задержка перед открытием новой вкладки (в миллисекундах)
      setTimeout(() => {
        window.open(pdf.output('bloburl'), '_blank');
      }, 500); // Например, задержка в 500 миллисекунд
    }).catch(error => {
      console.error('Ошибка при создании canvas:', error);
    });
  }

  downloadPdf(): void {
    const elementToCapture = this.ticketContainerRef.nativeElement;

    html2canvas(elementToCapture).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('ticket.pdf');
    }).catch(error => {
      console.error('Ошибка при создании canvas:', error);
    });
  }

  addRipple(event: MouseEvent) {
    const button = event.currentTarget as HTMLElement;
    button.classList.add('ripple');

    setTimeout(() => {
      button.classList.remove('ripple');
    }, 520);
  }
}