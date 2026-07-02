import { Injectable } from '@angular/core';

export interface Toast {
  title: string;
  message: string;
  type: 'success' | 'danger' | 'warning' | 'info';
  delay?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts: Toast[] = [];

  show(title: string, message: string, type: 'success' | 'danger' | 'warning' | 'info' = 'info', delay = 5000): void {
    const toast: Toast = { title, message, type, delay };
    this.toasts.push(toast);

    setTimeout(() => {
      this.remove(toast);
    }, delay);
  }

  showSuccess(title: string, message: string): void {
    this.show(title, message, 'success');
  }

  showError(title: string, message: string): void {
    this.show(title, message, 'danger');
  }

  showWarning(title: string, message: string): void {
    this.show(title, message, 'warning');
  }

  showInfo(title: string, message: string): void {
    this.show(title, message, 'info');
  }

  remove(toast: Toast): void {
    this.toasts = this.toasts.filter(t => t !== toast);
  }
}
