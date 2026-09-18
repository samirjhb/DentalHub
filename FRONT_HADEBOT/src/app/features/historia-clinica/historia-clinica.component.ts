import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { FichaClinicaComponent } from './ficha-clinica/ficha-clinica.component';
import { PrescripcionesComponent } from './prescripciones/prescripciones.component';

@Component({
  selector: 'app-historia-clinica',
  templateUrl: './historia-clinica.component.html',
  styleUrls: ['./historia-clinica.component.css'],
  standalone: true,
  imports: [
    MatTabsModule,
    FichaClinicaComponent,
    PrescripcionesComponent,
  ],
})
export class HistoriaClinicaComponent {}
