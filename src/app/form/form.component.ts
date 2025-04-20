import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule],
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  standalone: true
})
export class FormComponent implements OnInit {
  selectedTrain: any;

  constructor(private router: Router) {}

  ngOnInit() {
    const navigationState = this.router.getCurrentNavigation()?.extras?.state;
    this.selectedTrain = navigationState?.['selectedTrain'];
    console.log('Selected Train in FormComponent:', this.selectedTrain);

    if (!this.selectedTrain) {
      this.selectedTrain = history.state?.selectedTrain;
      console.log('From history.state:', this.selectedTrain);
    }
  }
}