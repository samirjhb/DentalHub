# Sistema de Gestión para Clínica Dental

## Descripción General

Este sistema de gestión para clínicas dentales es una aplicación web desarrollada con Angular que permite administrar de manera eficiente todos los aspectos relacionados con la atención de pacientes, desde el registro inicial hasta la facturación de servicios. La aplicación está diseñada para optimizar los procesos administrativos y clínicos de consultorios dentales, mejorando la experiencia tanto para el personal como para los pacientes.

## Características Principales

### 1. Registro de Pacientes

Este módulo permite la creación y gestión de perfiles completos de pacientes, incluyendo:

- Información personal (nombre, fecha de nacimiento, género)
- Datos de contacto (teléfono, correo electrónico, dirección)
- Historial médico relevante
- Historial dental previo
- Notas adicionales y observaciones
- Documentos adjuntos (consentimientos firmados, etc.)

### 2. Evaluación y Diagnóstico

Facilita el registro y seguimiento de exámenes dentales y radiografías:

- Exámenes dentales completos con odontograma interactivo
- Registro de caries, enfermedad periodontal y otras condiciones
- Almacenamiento y visualización de radiografías dentales
- Historial de diagnósticos previos
- Comparación de evolución entre visitas

### 3. Plan de Tratamiento

Permite crear y gestionar planes de tratamiento personalizados:

- Creación de planes con múltiples tratamientos
- Programación de fechas para cada procedimiento
- Estimación detallada de costos
- Priorización de tratamientos
- Estado de avance del plan (pendiente, en progreso, completado)

### 4. Gestión de Tratamientos

Registro detallado de cada tipo de tratamiento dental ofrecido:

- Catálogo de procedimientos disponibles
- Registro de materiales utilizados
- Tiempo estimado por procedimiento
- Profesionales asignados a cada tratamiento
- Seguimiento de tratamientos completados y pendientes

### 5. Seguimiento de Pacientes

Control del progreso y evolución de cada paciente:

- Registro cronológico de todas las visitas
- Documentación de tratamientos realizados en cada visita
- Seguimiento de resultados y complicaciones
- Recordatorios para citas de control
- Notificaciones para tratamientos pendientes

### 6. Facturación

Sistema completo para la gestión financiera:

- Generación automática de facturas
- Desglose detallado de tratamientos y costos
- Aplicación de descuentos y promociones
- Cálculo automático de impuestos
- Múltiples métodos de pago
- Historial de pagos y facturas pendientes

## Arquitectura del Sistema

La aplicación está estructurada siguiendo el patrón Modelo-Vista-Controlador (MVC), con los siguientes componentes principales:

### Modelos de Datos

1. **Paciente**
   ```typescript
   interface Paciente {
     id: string;
     nombre: string;
     apellidos: string;
     fechaNacimiento: Date;
     genero: string;
     telefono: string;
     email: string;
     direccion: string;
     historialMedico: string;
     historialDental: string;
     notas: string;
     fechaRegistro: Date;
   }
   ```

2. **ExamenDental**
   ```typescript
   interface ExamenDental {
     id: string;
     pacienteId: string;
     fecha: Date;
     odontograma: any; // Estructura compleja para el odontograma
     observaciones: string;
     doctorId: string;
   }
   ```

3. **Radiografia**
   ```typescript
   interface Radiografia {
     id: string;
     pacienteId: string;
     fecha: Date;
     tipo: string; // Panorámica, periapical, etc.
     urlImagen: string;
     observaciones: string;
     doctorId: string;
   }
   ```

4. **PlanTratamiento**
   ```typescript
   interface PlanTratamiento {
     id: string;
     pacienteId: string;
     fechaCreacion: Date;
     estado: string; // Pendiente, En progreso, Completado
     tratamientos: TratamientoPlanificado[];
     costoTotal: number;
     observaciones: string;
     doctorId: string;
   }
   ```

5. **TratamientoPlanificado**
   ```typescript
   interface TratamientoPlanificado {
     id: string;
     planTratamientoId: string;
     catalogoTratamientoId: string;
     fechaProgramada: Date;
     estado: string; // Pendiente, Completado, Cancelado
     costo: number;
     prioridad: number;
     observaciones: string;
   }
   ```

6. **CatalogoTratamiento**
   ```typescript
   interface CatalogoTratamiento {
     id: string;
     nombre: string;
     descripcion: string;
     duracionEstimada: number; // en minutos
     precioBase: number;
     categoria: string;
     materiales: string[];
   }
   ```

7. **RegistroTratamiento**
   ```typescript
   interface RegistroTratamiento {
     id: string;
     pacienteId: string;
     tratamientoPlanificadoId: string;
     fecha: Date;
     duracionReal: number;
     materialesUsados: string[];
     observaciones: string;
     doctorId: string;
     resultado: string;
   }
   ```

8. **Factura**
   ```typescript
   interface Factura {
     id: string;
     pacienteId: string;
     fecha: Date;
     tratamientos: ItemFactura[];
     subtotal: number;
     descuento: number;
     impuestos: number;
     total: number;
     estado: string; // Pendiente, Pagada, Anulada
     metodoPago: string;
     observaciones: string;
   }
   ```

9. **ItemFactura**
   ```typescript
   interface ItemFactura {
     id: string;
     facturaId: string;
     tratamientoId: string;
     descripcion: string;
     cantidad: number;
     precioUnitario: number;
     descuento: number;
     total: number;
   }
   ```

## Seguridad

El sistema implementa un robusto mecanismo de autenticación y autorización:

- Inicio de sesión seguro con JWT (JSON Web Tokens)
- Almacenamiento de tokens en sessionStorage
- Protección de rutas mediante guards de Angular
- Interceptores HTTP para incluir tokens en todas las peticiones
- Cierre automático de sesión por inactividad
- Diferentes niveles de acceso según rol (administrador, doctor, asistente)

## Requisitos Técnicos

- Node.js 18.x o superior
- Angular 17.x
- Base de datos MongoDB
- API RESTful para la comunicación con el backend

## Instalación y Configuración

1. Clonar el repositorio
   ```bash
   git clone https://github.com/tu-usuario/clinica-dental-app.git
   ```

2. Instalar dependencias
   ```bash
   cd clinica-dental-app
   npm install
   ```

3. Configurar variables de entorno
   ```bash
   cp .env.example .env
   # Editar .env con las configuraciones necesarias
   ```

4. Iniciar la aplicación en modo desarrollo
   ```bash
   ng serve
   ```

5. Acceder a la aplicación
   ```
   http://localhost:4200
   ```

## Contacto y Soporte

Para más información o soporte técnico, contactar a:
- Email: soporte@clinicadental.com
- Teléfono: +123 456 7890

---

© 2025 Clínica Dental App. Todos los derechos reservados.
