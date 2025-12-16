import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TranslationService } from '../services/translation.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 't',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private lastKey = '';
  private lastLang = '';
  private subscription: Subscription | null = null;
  private currentValue = '';

  constructor(
    private translation: TranslationService,
    private cdr: ChangeDetectorRef
  ) {}

  transform(key: string): string {
    const currentLang = this.translation.lang$.value;

    // Anahtar veya dil değiştiyse yeniden çevir
    if (key !== this.lastKey || currentLang !== this.lastLang) {
      this.lastKey = key;
      this.lastLang = currentLang;
      this.currentValue = this.translation.translate(key);

      // İlk kez çağrılıyorsa subscription oluştur
      if (!this.subscription) {
        this.subscription = this.translation.lang$.subscribe(() => {
          this.currentValue = this.translation.translate(this.lastKey);
          this.cdr.markForCheck();
        });
      }
    }

    return this.currentValue;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
