import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '../../shared/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, TranslatePipe],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {

  // ================= STATE =================
  users: any[] = [];
  apiUrl = `${environment.apiBaseUrl}/api/admin/users`;

  deletingId: number | null = null;

  newUser = {
    fullName: '',
    tckn: '',
    email: '',
    password: '',
    isAdmin: false
  };

  editingUser: any = null;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private i18n: TranslationService
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.loadUsers();
  }

  // ================= LOAD USERS =================
  loadUsers() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.users = data;
        this.cdr.detectChanges(); // zoneless fix
      },
      error: (err) => {
        console.error('Load Users Error', err);
      }
    });
  }

  trackByUserId(index: number, user: any) {
    return user.id;
  }

  // ================= CREATE USER =================
  createUser() {
    if (!this.newUser.fullName || !this.newUser.tckn || !this.newUser.email || !this.newUser.password) return;

    this.http.post<any>(this.apiUrl, this.newUser).subscribe({
      next: () => {
        this.newUser = { fullName: '', tckn: '', email: '', password: '', isAdmin: false };
        this.loadUsers();
      },
      error: (err) => {
        console.error('CREATE USER ERROR', err);
      }
    });
  }

  // ================= EDIT USER =================
  startEdit(user: any) {
    this.editingUser = { ...user }; // clone
    
  }

  updateUser() {
    if (!this.editingUser) return;

    this.http.put(
      `${this.apiUrl}/${this.editingUser.id}`,
      {
        fullName: this.editingUser.fullName,
        tckn: this.editingUser.tckn,
        email: this.editingUser.email,
        isAdmin: this.editingUser.isAdmin
      }
    ).subscribe({
      next: () => {
        this.editingUser = null;
        this.loadUsers();
      },
      error: (err) => {
        console.error('UPDATE USER ERROR', err);
      }
    });
  }

  cancelEdit() {
    this.editingUser = null;
  }

  onTcknInput(target: EventTarget | null, model: 'new' | 'edit') {
    const input = target as HTMLInputElement | null;
    if (!input) return;

    const sanitized = input.value.replace(/\D/g, '').slice(0, 11);
    input.value = sanitized;

    if (model === 'new') {
      this.newUser.tckn = sanitized;
      return;
    }

    if (this.editingUser) {
      this.editingUser.tckn = sanitized;
    }
  }

  // ================= DELETE USER =================
  deleteUser(id: number) {
    if (!confirm(this.i18n.translate('adminUsers.delete.confirm'))) return;

    this.deletingId = id;

    this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        finalize(() => {
          this.deletingId = null;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          console.error('DELETE ERROR', err);
        }
      });
  }
}
