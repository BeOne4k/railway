import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { TicketComponent } from './ticket/ticket.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, TicketComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'railway';
}
