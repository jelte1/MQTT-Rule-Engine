import { Component, inject, signal } from '@angular/core';
import {
  MatCard, MatCardActions, MatCardContent,
  MatCardHeader, MatCardSubtitle, MatCardTitle
} from '@angular/material/card';
import {Router, RouterLink} from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import {form, FormField, required, validate} from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterModel } from '../../../../core/models/auth.model';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  imports: [
    MatCard, MatCardContent, MatCardActions, MatCardHeader,
    MatCardSubtitle, MatCardTitle, RouterLink,
    FormsModule, ReactiveFormsModule,
    MatFormField, MatInput, MatLabel, FormField,
    MatButton, MatIcon
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})

export class Register {
  private readonly authService = inject(AuthService);
  private snack = inject(MatSnackBar);
  private router = inject(Router);

  protected registerModel = signal<RegisterModel>({
    username: '',
    password: '',
  });

  registerForm = form(this.registerModel, (schemaPath) => {
    required(schemaPath.username, { message: 'Username is required' });
    required(schemaPath.password, { message: 'Password is required' });
    validate(schemaPath.password, (field) => {
      const value = field.value();
      if (!value) return null;
      if (value.length < 6)
        return { kind: 'minLength', message: 'Password must be at least 6 characters.' };
      if (!/[0-9]/.test(value))
        return { kind: 'requireDigit', message: 'Password must contain at least one digit.' };
      if (!/[A-Z]/.test(value))
        return { kind: 'requireUppercase', message: 'Password must contain at least one uppercase letter.' };
      if (!/[a-z]/.test(value))
        return { kind: 'requireLowercase', message: 'Password must contain at least one lowercase letter.' };
      if (!/[^a-zA-Z0-9]/.test(value))
        return { kind: 'requireSpecial', message: 'Password must contain at least one special character.' };
      return null;
    });
  });

  submit(): void {
    if (this.registerForm().invalid()) {
      alert('Make sure to fill in all the fields correctly.');
      return;
    }

    this.authService.register(this.registerModel()).subscribe({
      next: () => {
        this.snack.open('Account successfully created', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/login']);
      },
      error: () => {
        this.snack.open('Failed to create account, please try again.', 'Dismiss', { duration: 3000 });
      }
    });
  }
}
