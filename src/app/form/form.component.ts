import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Seat {
  seatId: string;
  number: string;
  price: number;
  isOccupied: boolean;
  vagonId: number;
}

interface Vagon {
  id: number;
  trainId: number;
  trainNumber: number;
  name: string;
  seats: Seat[];
}

@Component({
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule],
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  standalone: true
})
export class FormComponent implements OnInit {
  selectedTrain: any = { vagons: [] };
  passengerCount: number = 1;
  passengersArray: any[] = [];
  activePassengerIndex: number | null = null;
  showVagons = false;
  selectedVagonIndex: number | null = null;

  @ViewChild('errorDiv') errorDiv!: ElementRef;

  vagonPrices: { [key: string]: number } = {
    'II კლასი': 75,
    'I კლასი': 35,
    'ბიზნესი': 125
  };

  constructor(private router: Router, private cdr: ChangeDetectorRef, private http: HttpClient) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {
      selectedTrain: any,
      passengerCount: number
    };

    if (state) {
      this.selectedTrain = state.selectedTrain;
      this.passengerCount = state.passengerCount;
    }
  }

  ngOnInit(): void {
    this.passengersArray = Array.from({ length: this.passengerCount }, () => ({
      firstName: '',
      lastName: '',
      passportNumber: '',
      selectedSeat: { vagonIndex: null, seat: null, price: null },
    }));

    this.loadVagons();
  }

  loadVagons() {
    this.http.get<Vagon[]>('https://railway.stepprojects.ge/api/vagons').subscribe(
      (vagonsData) => {
        if (this.selectedTrain?.vagons) {
          this.selectedTrain.vagons = this.selectedTrain.vagons.map((vagon: Vagon) => {
            const matchingVagonData = vagonsData.find(
              (vd) => vd.trainId === this.selectedTrain.id && vd.name === vagon.name
            );
            return matchingVagonData ? { ...vagon, seats: matchingVagonData.seats } : vagon;
          });
          console.log('Данные о вагонах загружены:', this.selectedTrain.vagons);
        } else {
          console.warn('Объект selectedTrain или его свойство vagons не определены.');
        }
      },
      (error) => {
        console.error('Ошибка при загрузке данных о вагонах:', error);
      }
    );
  }

  addRipple(event: MouseEvent) {
    const button = event.currentTarget as HTMLElement;
    button.classList.add('ripple');

    setTimeout(() => {
      button.classList.remove('ripple');
    }, 520);
  }

  openVagons(index: number) {
    this.activePassengerIndex = index;
    this.showVagons = true;
  }

  closeVagons() {
    this.showVagons = false;
    this.selectedVagonIndex = null;
  }

  getVagonImage(index: number): string {
    const total = this.selectedTrain?.vagons?.length || 0;

    if (index === 0) {
      return 'https://railway.stepprojects.ge/images/firstWagon.png';
    } else if (index === total - 1) {
      return 'https://railway.stepprojects.ge/images/lastWagon.png';
    } else {
      return 'https://railway.stepprojects.ge/images/midWagon.png';
    }
  }

  selectVagon(index: number) {
    this.selectedVagonIndex = index;
  }

  selectSeat(seat: Seat) {
    if (seat.isOccupied) return;

    if (this.activePassengerIndex !== null && this.selectedVagonIndex !== null) {
      const updatedPassenger = { ...this.passengersArray[this.activePassengerIndex] };
      updatedPassenger.selectedSeat = {
        vagonIndex: this.selectedVagonIndex,
        seat: seat.number,
        price: seat.price
      };
      this.passengersArray = this.passengersArray.map((passenger, index) =>
        index === this.activePassengerIndex ? updatedPassenger : passenger
      );

      this.cdr.detectChanges();
    }
  }

  isSeatTaken(seatNumber: string): boolean {
    return this.passengersArray.some(
      (p, idx) =>
        idx !== this.activePassengerIndex &&
        p.selectedSeat?.vagonIndex === this.selectedVagonIndex &&
        p.selectedSeat?.seat === seatNumber
    );
  }

  calculateTotal(): number {
    return this.passengersArray.reduce((total, passenger) => {
      return total + (passenger.selectedSeat?.price || 0);
    }, 0);
  }

  validateForm(): boolean {
    const isValid = this.passengersArray.every(
      passenger =>
        passenger.firstName && passenger.lastName && passenger.passportNumber
    );
    console.log('Form is valid:', isValid);
    return isValid;
  }

  proceedToPayment() {
    if (this.validateForm()) {
      this.errorDiv.nativeElement.classList.remove('show');
      console.log('Form is valid - removing show class');
      alert('Form is valid! Proceeding to payment...');
    } else {
      this.errorDiv.nativeElement.classList.add('show');
      this.cdr.detectChanges();
      console.log('Form is invalid - adding show class');
    }
  }

  getSeatRows(seats: Seat[] | undefined): Seat[][] {
    if (!seats || seats.length === 0) {
      return [];
    }

    const columns: { [key: string]: Seat[] } = {
      A: [],
      B: [],
      C: [],
      D: []
    };

    seats.forEach(seat => {
      const lastChar = seat.number.slice(-1).toUpperCase();
      if (columns[lastChar]) {
        columns[lastChar].push(seat);
      }
    });

    const sortedColumns = Object.values(columns).map(column => {
      return column.sort((a, b) => {
        const numberA = parseInt(a.number.slice(0, -1), 10);
        const numberB = parseInt(b.number.slice(0, -1), 10);
        return numberA - numberB;
      });
    });

    return sortedColumns;
  }
}