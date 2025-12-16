import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '../../shared/translate.pipe';
import { TranslationService } from '../../services/translation.service';


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
  apiUrl = 'http://localhost:5096/api/admin/users';

  deletingId: number | null = null;

  newUser = {
    fullName: '',
    email: ''
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
    if (!this.newUser.fullName || !this.newUser.email) return;

    this.http.post<any>(this.apiUrl, this.newUser).subscribe({
      next: () => {
        this.newUser = { fullName: '', email: '' };
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
        email: this.editingUser.email
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
