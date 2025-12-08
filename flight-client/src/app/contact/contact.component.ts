import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {

  form = {
    fullName: '',
    email: '',
    subject: '',
    message: ''
  };

  constructor(private http: HttpClient) {}

  send() {
    this.http.post("http://localhost:5096/api/ContactApi/send", this.form)
      .subscribe(() => {
        Swal.fire("Gönderildi", "Mesajınız başarıyla ulaştı!", "success");
        this.form = { fullName: '', email: '', subject: '', message: '' };
      });
  }
}
