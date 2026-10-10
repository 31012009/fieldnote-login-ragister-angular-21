import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';
import { passwordsMatchValidator } from '../password-match.validator';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly registrationForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatchValidator });
  isPasswordVisible = false;
  isSubmitting = false;
  errorMessage = '';

  async submitRegistration(): Promise<void> {
    this.registrationForm.markAllAsTouched();
    if (this.registrationForm.invalid || this.isSubmitting) return;
    this.isSubmitting = true;
    this.errorMessage = '';
    try {
      const { name, email, password } = this.registrationForm.getRawValue();
      await this.authService.register(name, email, password);
      await this.router.navigate(['/login'], { state: { notice: 'Your account is ready. Sign in to continue.' } });
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Your account could not be created.';
    } finally {
      this.isSubmitting = false;
    }
  }
}