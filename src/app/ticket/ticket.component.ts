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
  styleUrls: ['./ticket.component.scss']
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
      });
  }
}