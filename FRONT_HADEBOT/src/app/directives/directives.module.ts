import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RutFormatDirective } from './rut-format.directive';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RutFormatDirective
  ],
  exports: [
    RutFormatDirective
  ]
})
export class DirectivesModule { }
