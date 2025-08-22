import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  id: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToasterService {
  private toasts: Toast[] = [];
  private toastSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastSubject.asObservable();

  show(
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info'
  ) {
    const toast: Toast = {
      message,
      type,
      id: Date.now(),
    };
    this.toasts.push(toast);
    this.toastSubject.next([...this.toasts]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      this.remove(toast.id);
    }, 3000);
  }

  remove(id: number) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.toastSubject.next([...this.toasts]);
  }
}
