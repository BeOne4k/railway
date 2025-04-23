import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  addRipple(event: MouseEvent) {
    const button = event.currentTarget as HTMLElement;
    button.classList.add('ripple');
  
    setTimeout(() => {
      button.classList.remove('ripple');
    }, 520);
  }

  stations: Station[] = [];
  selectedDate: Date | null = null;

   constructor(private http: HttpClient, private router: Router) {}

   getGeorgianDayName(date: Date): string {
    const days = ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი'];
    return days[date.getDay()];
  }

   fromStation: string = '';
   toStation: string = '';
   today: Date = new Date(); 

   passengerCount!: number;

   goToTrains() {
    console.log(this.passengerCount)
    const georgianDay = this.selectedDate ? this.getGeorgianDayName(this.selectedDate) : '';
  
    this.router.navigate(['/trains'], {
      queryParams: {
        from: this.fromStation,
        to: this.toStation,
        date: georgianDay,
        passengers: this.passengerCount
      }
    });
   }


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