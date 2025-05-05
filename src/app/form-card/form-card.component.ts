import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-card.component.html',
  styleUrls: ['./form-card.component.scss']
})
export class FormCardComponent implements OnInit {
  registrationResponse: any;
  totalPrice: number | null = null;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.registrationResponse = navigation?.extras?.state?.['registrationResponse'];
    this.totalPrice = navigation?.extras?.state?.['totalPrice'];
  }

  ngOnInit(): void {
    console.log('Response from registration:', this.registrationResponse);
    console.log('Total price:', this.totalPrice);
  }

  getBookingReference(response: any): string {
    return response?.id || 'N/A';
  }

  addRipple(event: MouseEvent) {
    const button = event.currentTarget as HTMLElement;
    button.classList.add('ripple');

    setTimeout(() => {
      button.classList.remove('ripple');
    }, 520);
  }
}