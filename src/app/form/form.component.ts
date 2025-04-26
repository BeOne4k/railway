import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule],
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  standalone: true
})
export class FormComponent implements OnInit {
  selectedTrain: any;
  passengerCount: number = 1;
  passengersArray: any[] = [];
  activePassengerIndex: number | null = null;
  showVagons = false;
  selectedVagonIndex: number | null = null;
  seatRows: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  @ViewChild('errorDiv') errorDiv!: ElementRef;

  vagonPrices: { [key: string]: number } = {
    'II კლასი': 75,
    'I კლასი': 35,
    'ბიზნესი': 125
  };

  constructor(private router: Router, private cdr: ChangeDetectorRef) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {
      selectedTrain: any,
      passengerCount: number
    };

    if (state) {
      this.selectedTrain = state.selectedTrain;
      this.passengerCount = state.passengerCount
    }
  }

  ngOnInit(): void {
    this.passengersArray = Array.from({ length: this.passengerCount }, () => ({
      firstName: '',
      lastName: '',
      passportNumber: '',
      selectedSeat: { vagonIndex: null, seat: null, price: null },
    }));
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
    this.selectedVagonIndex = this.passengersArray[index].selectedSeat?.vagonIndex;
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

  selectSeat(seat: string) {
    if (this.isSeatTaken(seat)) return;

    if (this.activePassengerIndex !== null && this.selectedVagonIndex !== null) {
      const selectedVagonName = this.selectedTrain?.vagons[this.selectedVagonIndex]?.name;
      const price = selectedVagonName ? this.vagonPrices[selectedVagonName] : null;

      const updatedPassenger = { ...this.passengersArray[this.activePassengerIndex] };
      updatedPassenger.selectedSeat = {
        vagonIndex: this.selectedVagonIndex,
        seat: seat,
        price: price
      };
      this.passengersArray = this.passengersArray.map((passenger, index) =>
        index === this.activePassengerIndex ? updatedPassenger : passenger
      );

      this.cdr.detectChanges();
    }
  }

  isSeatTaken(seat: string): boolean {
    return this.passengersArray.some(
      (p, idx) =>
        idx !== this.activePassengerIndex &&
        p.selectedSeat?.vagonIndex === this.selectedVagonIndex &&
        p.selectedSeat?.seat === seat
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
}