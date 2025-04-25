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
    }
  
  }

  ngOnInit(): void {
    this.passengersArray = Array.from({ length: this.passengerCount }, (_, i) => ({
      firstName: '',
      lastName: '',
      passportNumber: ''
    }));
  }

  addRipple(event: MouseEvent) {
    const button = event.currentTarget as HTMLElement;
    button.classList.add('ripple');

    setTimeout(() => {
      button.classList.remove('ripple');
    }, 520);
  }
  

  showVagons = false;

openVagons() {
  this.showVagons = true;
}

closeVagons() {
  this.showVagons = false;
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




}