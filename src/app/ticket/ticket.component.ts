import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';

interface Station {
  id: string;
  name: string;
}

@Component({
  selector: 'app-ticket',
  standalone: true,
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss'],

  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule
  ]
  
})
export class TicketComponent implements OnInit {
  stations: Station[] = [];
  selectedDate: Date | null = null;

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