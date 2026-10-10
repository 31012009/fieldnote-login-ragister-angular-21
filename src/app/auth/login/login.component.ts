import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });
  isPasswordVisible = false;
  isSubmitting = false;
  errorMessage = '';
  notice = history.state?.notice ?? '';

  async submitLogin(): Promise<void> {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid || this.isSubmitting) return;
    this.isSubmitting = true;
    this.errorMessage = '';
    try {
      const { email, password } = this.loginForm.getRawValue();
      await this.authService.login(email, password);
      await this.router.navigate(['/account']);
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Sign in could not be completed.';
    } finally {
      this.isSubmitting = false;
    }
  }
}