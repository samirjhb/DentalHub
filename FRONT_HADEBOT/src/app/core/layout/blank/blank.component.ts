import { Component } from '@angular/core';
import { CoreService } from 'src/app/core/layout/services/core.service';
import { ThemeService } from 'src/app/core/layout/services/theme.service';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MaterialModule } from 'src/app/shared/material.module';

@Component({
  selector: 'app-blank',
  templateUrl: './blank.component.html',
  styleUrls: [],
  imports: [RouterOutlet, MaterialModule, CommonModule],
})
export class BlankComponent {
  private htmlElement!: HTMLHtmlElement;

  options = this.settings.getOptions();
  theme = this.themeService.theme;

  constructor(
    private settings: CoreService,
    private themeService: ThemeService,
  ) {
    this.htmlElement = document.querySelector('html')!;
  }


}
