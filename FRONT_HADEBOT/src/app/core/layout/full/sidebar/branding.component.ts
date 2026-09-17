import { Component } from '@angular/core';
import { CoreService } from 'src/app/core/layout/services/core.service';
import { BrandLogoComponent } from 'src/app/shared/components/brand-logo/brand-logo.component';

@Component({
  selector: 'app-branding',
  imports: [BrandLogoComponent],
  template: `
    <a href="/" class="logodark m-2 d-flex">
      <app-brand-logo></app-brand-logo>
    </a>
  `,
})
export class BrandingComponent {
  options = this.settings.getOptions();
  constructor(private settings: CoreService) {}
}
