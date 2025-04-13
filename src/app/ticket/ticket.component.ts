import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface Station {
  id: string;
  name: string;
}

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.css']
})
export class TicketComponent implements OnInit {
  stations: Station[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchStations();
  }

  fetchStations(): void {
    this.http.get<Station[]>('https://railway.stepprojects.ge/api/stations')
      .subscribe({
        next: (data) => {
          this.stations = data;
        },
        error: (error) => {
          console.error('error:', error);
          this.stations = this.getFallbackStations();
        }
      });
  }

  private getFallbackStations(): Station[] {
    return [
      { id: '1', name: 'Тбилиси' },
      { id: '2', name: 'Батуми' },
      { id: '3', name: 'Кутаиси' }
    ];
  }
}