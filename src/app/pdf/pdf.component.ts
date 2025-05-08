import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pdf',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pdf.component.html',
  styleUrl: './pdf.component.scss'
})
export class PdfComponent implements OnInit {

  ticketNumber: string | null = null;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.ticketNumber = this.route.snapshot.queryParamMap.get('ticket');

    if (this.ticketNumber) {
      console.log('Received Ticket Number:', this.ticketNumber);
      this.loadPdfDocument();
    } else {
      console.error('Ticket number not found in query parameters.');
    }
  }

  loadPdfDocument(): void {
    if (this.ticketNumber) {
      console.log(`Loading PDF for ticket: ${this.ticketNumber}`);
    }
  }
}