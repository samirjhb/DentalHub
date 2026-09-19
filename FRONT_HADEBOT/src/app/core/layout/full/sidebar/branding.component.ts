import { Component, Input } from '@angular/core';
import { CoreService } from 'src/app/core/layout/services/core.service';
import { BrandLogoComponent } from 'src/app/shared/components/brand-logo/brand-logo.component';

@Component({
  selector: 'app-branding',
  imports: [BrandLogoComponent],
  template: `
    <a href="/" class="logodark m-2 d-flex">
      <app-brand-logo [showWordmark]="!collapsed" [size]="collapsed ? 28 : 36"></app-brand-logo>
    </a>
  `,
})
export class BrandingComponent {
  @Input() collapsed = false;
  options = this.settings.getOptions();
  constructor(private settings: CoreService) {}
}
