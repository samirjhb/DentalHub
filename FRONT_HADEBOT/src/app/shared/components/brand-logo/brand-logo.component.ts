import { Component, Input } from '@angular/core';

// Logo como SVG inline (no imagen rasterizada): escala sin pixelado y sigue el
// tema claro/oscuro. Reutiliza la misma silueta de diente del Odontograma
// (features/historia-clinica/odontograma) para que el ícono de marca sea
// coherente con el resto de la identidad visual dental de la app.
@Component({
  selector: 'app-brand-logo',
  standalone: true,
  template: `
    <span class="brand-logo" [style.height.px]="size">
      <svg
        [attr.width]="size"
        [attr.height]="size"
        viewBox="0 0 40 40"
        class="brand-logo__icon"
      >
        <rect x="0" y="0" width="40" height="40" rx="10" class="brand-logo__badge" />
        <path
          d="M20 7 C13 7 10 12 10 17 C10 21 11 23 12 25 C13 27 14 31 15.5 33 C16.5 34 17 32 17 29 C17 27 18 25.5 20 25.5 C22 25.5 23 27 23 29 C23 32 23.5 34 24.5 33 C26 31 27 27 28 25 C29 23 30 21 30 17 C30 12 27 7 20 7 Z"
          class="brand-logo__tooth"
        />
      </svg>
      @if (showWordmark) {
      <span class="brand-logo__wordmark">Hadebot</span>
      }
    </span>
  `,
  styles: [
    `
      .brand-logo {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        line-height: 1;
      }

      .brand-logo__badge {
        fill: var(--mat-sys-primary, #5d87ff);
      }

      .brand-logo__tooth {
        fill: #fff;
      }

      .brand-logo__wordmark {
        font-size: 1.35rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: var(--mat-sys-on-background, #2a3547);
      }
    `,
  ],
})
export class BrandLogoComponent {
  @Input() size = 36;
  @Input() showWordmark = true;
}
