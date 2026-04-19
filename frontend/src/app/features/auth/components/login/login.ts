import {Component, inject, signal} from '@angular/core';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle
} from '@angular/material/card';
import {Router, RouterLink} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {form, FormField, required} from '@angular/forms/signals';
import {LoginModel} from '../../../../core/models/auth.model';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {AuthService} from '../../../../core/services/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  imports: [
    MatCard,
    MatCardContent,
    MatCardActions,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    FormField,
    MatCardSubtitle,
    MatCardTitle,
    MatCardHeader,
    MatButton,
    MatIcon
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})

export class Login {

  private readonly authService = inject(AuthService);
  private snack = inject(MatSnackBar);
  private router = inject(Router);

  protected loginModel = signal<LoginModel>({
    username: '',
    password: '',
  });

  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.username, {message: 'Username is required'});
    required(schemaPath.password, {message: 'Password is required'});
  });

  submit(): void {
    if (this.loginForm().invalid()) {
      alert("Make sure to fill in all the fields correctly.");
      return;
    }
    this.login();
  }

  login(): void {
    this.authService.login(this.loginModel()).subscribe({
      next: () => {
        this.snack.open('Login successful', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.snack.open('Login failed. Please check your credentials and try again.', 'Dismiss', { duration: 3000 });
      }
    });
  }
}
