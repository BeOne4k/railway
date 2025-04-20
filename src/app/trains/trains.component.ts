import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Train {
  id: number;
  number: number;
  from: string;
  to: string;
  departure: string;
  arrive: string;
  date: string;
}

@Component({
  selector: 'app-trains',
  standalone: true,
  templateUrl: './trains.component.html',
  styleUrls: ['./trains.component.scss'],
  imports: [CommonModule]
})
export class TrainsComponent implements OnInit {

  addRipple(event: MouseEvent) {
    const button = event.currentTarget as HTMLElement;
    button.classList.add('ripple');

    setTimeout(() => {
      button.classList.remove('ripple');
    }, 520);
  }

  trains: Train[] = [];
  filteredTrains: Train[] = [];

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    this.http.get<Train[]>('https://railway.stepprojects.ge/api/trains')
      .subscribe((trains) => {
        this.trains = trains;
  
        this.route.queryParams.subscribe(params => {
          const from = params['from'];
          const to = params['to'];
          const date = params['date'];
          
          
          this.filteredTrains = this.trains.filter(train =>
            train.from === from &&
            train.to === to &&
            train.date === date
          );
        });
      });
  }
  
}
