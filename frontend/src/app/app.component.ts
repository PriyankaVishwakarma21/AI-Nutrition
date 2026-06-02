import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  template: `
    @if (auth.isAuthenticated()) {
      <app-navbar />
    }
    <main [class.with-navbar]="auth.isAuthenticated()">
      <router-outlet />
    </main>
  `,
  styles: [`
    main { min-height: 100vh; }
    main.with-navbar { padding-top: 70px; }
  `]
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}
