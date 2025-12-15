import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-contact-block',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-block.component.html',
  styleUrls: ['./contact-block.component.css']
})
export class ContactBlockComponent {
  form = {
    fullName: '',
    email: '',
    subject: '',
    message: ''
  };

  constructor(private http: HttpClient) {}

  submit() {
    const { fullName, email, subject, message } = this.form;
    if (!fullName || !email || !subject || !message) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }

    this.http.post('http://localhost:5096/api/ContactApi/send', this.form).subscribe({
      next: () => {
        alert('Mesajınız gönderildi.');
        this.form = { fullName: '', email: '', subject: '', message: '' };
      },
      error: () => alert('Gönderim sırasında bir hata oluştu.')
    });
  }
}
