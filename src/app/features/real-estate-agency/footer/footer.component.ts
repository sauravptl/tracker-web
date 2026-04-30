import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  email = '';
  submitted = false;
  currentYear = new Date().getFullYear();

  onSubscribe(event: Event): void {
    event.preventDefault();
    if (this.email.trim()) {
      this.submitted = true;
      this.email = '';
    }
  }
}
