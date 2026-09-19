import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PacienteService } from './paciente.service';

describe('Service: Paciente', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PacienteService, provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('should be created', () => {
    const service = TestBed.inject(PacienteService);
    expect(service).toBeTruthy();
  });
});
