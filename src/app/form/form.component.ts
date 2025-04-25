import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

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

  constructor(private router: Router) {
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
      selectedSeat: { vagonIndex: null, seat: null }, // Изменено на объект
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
    this.selectedVagonIndex = this.passengersArray[index].selectedSeat?.vagonIndex; // Получаем индекс вагона
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
      this.passengersArray[this.activePassengerIndex].selectedSeat = {
        vagonIndex: this.selectedVagonIndex,
        seat: seat
      };
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
}