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

  email: string = '';
  phone: string = '';

  @ViewChild('errorDiv') errorDiv!: ElementRef;

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
          // console.log('error:', this.selectedTrain.vagons);
        } else {
          console.warn('error.');
        }
      },
      (error) => {
        console.error('error:', error);
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
        price: seat.price,
        seatId: seat.seatId
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

      const people = this.passengersArray.map(passenger => ({
        seatId: passenger.selectedSeat?.seatId || null,
        name: passenger.firstName,
        surname: passenger.lastName,
        idNumber: passenger.passportNumber,
        status: 'adult',
        payoutCompleted: true
      }));

      let formattedDate: string;
      if (this.selectedTrain?.date && this.isValidDate(this.selectedTrain.date)) {
        formattedDate = this.selectedTrain.date;
      } else {
        formattedDate = new Date().toISOString().split('T')[0];
      }

      const requestBody = {
        trainId: this.selectedTrain?.id,
        date: formattedDate,
        email: this.email,
        phoneNumber: this.phone,
        people: people
      };

      console.log('Request Body (Success Response):', requestBody);

      this.http.post('https://railway.stepprojects.ge/api/tickets/register', requestBody, { responseType: 'text' })
        .subscribe(
          (response) => {
            console.log('Registration successful:', response);

            this.router.navigate(['form-card'], {
              state: {
                registrationResponse: response,
                totalPrice: this.calculateTotal()
              }
            });
          },
          (error) => {
            console.error('Registration failed:', error);
            alert('Something went wrong.');
          }
        );

    } else {
      this.errorDiv.nativeElement.classList.add('show');
      this.cdr.detectChanges();
      console.log('Form is invalid - adding show class');
    }
  }

  calculateTotal(): number {
    return this.passengersArray.reduce((total, passenger) => {
      return total + (passenger.selectedSeat?.price || 0);
    }, 0);
  }

  isValidDate(dateString: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
  }

  isSeatTakenForOtherPassenger(seatNumber: string, vagonName: string): boolean {
    return this.passengersArray.some(
      (p) =>
        p.selectedSeat?.seat === seatNumber &&
        this.selectedTrain?.vagons[p.selectedSeat?.vagonIndex || -1]?.name === vagonName
    );
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