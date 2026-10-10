import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './account.component.html',
})
export class AccountComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  signOut(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}