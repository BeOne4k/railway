import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  constructor(private router: Router) {}

  goToHome() {
    this.router.navigate(['/']);
  }

  addRipple(event: MouseEvent) {
    const button = event.currentTarget as HTMLElement;
    button.classList.add('ripple');

    setTimeout(() => {
      button.classList.remove('ripple');
    }, 520);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const header = document.querySelector('header') as HTMLElement;
    if (!header) return;

    const currentUrl = this.router.url;

    if (currentUrl === '/ticket') {
      if (window.scrollY > 1) {
        header.style.backgroundColor = 'white';
      } else {
        header.style.backgroundColor = 'transparent';
      }
    } else {
      header.style.backgroundColor = 'white';
    }
  }
}
