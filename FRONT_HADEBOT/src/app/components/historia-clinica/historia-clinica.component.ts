import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { OdontogramaComponent } from '../odontograma/odontograma.component';
import { FichaClinicaComponent } from '../ficha-clinica/ficha-clinica.component';

@Component({
  selector: 'app-historia-clinica',
  templateUrl: './historia-clinica.component.html',
  styleUrls: ['./historia-clinica.component.css'],
  standalone: true,
  imports: [MatTabsModule, OdontogramaComponent, FichaClinicaComponent],
})
export class HistoriaClinicaComponent {}
