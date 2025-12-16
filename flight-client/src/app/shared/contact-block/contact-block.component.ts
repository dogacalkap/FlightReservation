import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslatePipe } from '../translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-contact-block',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
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

  constructor(
    private http: HttpClient,
    private i18n: TranslationService
  ) {}

  submit() {
    const { fullName, email, subject, message } = this.form;
    if (!fullName || !email || !subject || !message) {
      alert(this.i18n.translate('contact.form.error'));
      return;
    }

    this.http.post('http://localhost:5096/api/ContactApi/send', this.form).subscribe({
      next: () => {
        alert(this.i18n.translate('contact.form.success'));
        this.form = { fullName: '', email: '', subject: '', message: '' };
      },
      error: () => alert(this.i18n.translate('contact.form.serverError'))
    });
  }
}
