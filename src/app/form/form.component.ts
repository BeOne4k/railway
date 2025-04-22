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
export class FormComponent {
  selectedTrain: any;
  passengerCount: number = 1;
  passengersArray: any[] = [];

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {
      selectedTrain: any,
      passengerCount: number
    };
  
    if (state) {
      this.selectedTrain = state.selectedTrain;
      this.passengerCount = state.passengerCount
  
      this.passengersArray = Array(this.passengerCount).fill(0).map((_, i) => ({
        id: i + 1,
        firstName: '',
        lastName: '',
        age: null
      }));
    } else {
      this.selectedTrain = null;
      this.passengersArray = Array(this.passengerCount).fill(0).map((_, i) => ({
        id: i + 1,
        firstName: '',
        lastName: '',
        age: null
      }));
    }
  
    console.log('Selected Train:', this.selectedTrain);
    console.log('Passenger Count:', this.passengerCount);
  }
  onPassengerAction(index: number) {
    console.log('Passenger action:', this.passengersArray[index]);
  }
}