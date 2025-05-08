import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

interface TrainDetails {
  arrive: string;
  date: string;
  departure: string;
  departureId: number;
  from: string;
  id: number;
  name: string;
  number: number;
  to: string;
  vagons: any[];
}

@Component({
  selector: 'app-form-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-card.component.html',
  styleUrls: ['./form-card.component.scss']
})
export class FormCardComponent implements OnInit {
  paymentForm: FormGroup;
  registrationResponse: any;
  totalPrice: number | null = null;
  trainDetails: TrainDetails | null = null;
  selectedSeats: any[] = [];

  constructor(
    private router: Router,
    private fb: FormBuilder
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.registrationResponse = navigation?.extras?.state?.['registrationResponse'];
    this.totalPrice = navigation?.extras?.state?.['totalPrice'];
    this.trainDetails = navigation?.extras?.state?.['trainDetails'];
    this.selectedSeats = navigation?.extras?.state?.['selectedSeats'] || [];
    console.log('Selected Seats in FormCard:', this.selectedSeats);
    console.log('Train Details in FormCard:', this.trainDetails);
    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
      cvc: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
      cardholderName: ['']
    });
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

  formatCardNumber(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 16) {
      value = value.slice(0, 16);
    }
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
      formattedValue += value[i];
      if ((i + 1) % 4 === 0 && i < value.length - 1) {
        formattedValue += ' ';
      }
    }
    this.paymentForm.get('cardNumber')?.setValue(formattedValue);
    this.paymentForm.controls['cardNumber'].setValue(value, { emitModelToViewChange: false, emitEvent: true });
  }
  formatExpiryDate(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.slice(0, 4);
    }
    if (value.length >= 2 && !value.includes('/')) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    this.paymentForm.get('expiryDate')?.setValue(value);
  }

  formatCvc(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 3) {
      value = value.slice(0, 3);
    }
    this.paymentForm.get('cvc')?.setValue(value);
  }

  submitPayment() {
    if (this.paymentForm.valid) {
      console.log('Payment form submitted:', this.paymentForm.value);
      const responseText: string = this.registrationResponse;
      const ticketNumberPrefix = 'ბილეთის ნომერია:';
      const startIndex = responseText.indexOf(ticketNumberPrefix);
      const cardNumber = this.paymentForm.get('cardNumber')?.value.replace(/\s/g, '');
      const lastFourDigits = cardNumber.slice(-4);
      console.log('Last Four Digits in submitPayment:', lastFourDigits);

      let bookingReference: string | null = null;
      if (startIndex !== -1) {
        bookingReference = responseText.substring(startIndex + ticketNumberPrefix.length).trim();
      }

      if (bookingReference) {
        this.router.navigate(['/pdf'], {
          queryParams: {
            ticket: bookingReference,
            departureTime: this.trainDetails?.departure,
            arrivalTime: this.trainDetails?.arrive,
            departureDate: this.trainDetails?.date,
            fromLocation: this.trainDetails?.from,
            toLocation: this.trainDetails?.to,
            trainNumber: this.trainDetails?.number,
            selectedSeats: JSON.stringify(this.selectedSeats),
            lastFourCardDigits: lastFourDigits
          }
        });
      } else {
        console.error('Не удалось получить номер билета.');
      }
    } else {
      this.markFormGroupTouched(this.paymentForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    (Object as any).values(formGroup.controls).forEach((control: any) => {
      control.markAsTouched();
      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }
}