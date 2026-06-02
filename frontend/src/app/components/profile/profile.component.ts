import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  private authSvc = inject(AuthService);

  user    = signal<Partial<User>>({});
  loading = signal(false);
  success = signal(false);
  error   = signal('');

  ngOnInit(): void {
    const u = this.authSvc.currentUser();
    if (u) this.user.set({ ...u });
  }

  save(): void {
    this.loading.set(true); this.success.set(false); this.error.set('');
    this.authSvc.updateProfile(this.user()).subscribe({
      next: () => { this.success.set(true); this.loading.set(false); },
      error: (e) => { this.error.set(e.error?.message || 'Update failed'); this.loading.set(false); }
    });
  }

  get u() { return this.user(); }
  setField<K extends keyof User>(key: K, value: User[K]) {
    this.user.update(u => ({ ...u, [key]: value }));
  }
}
