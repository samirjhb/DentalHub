import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FichaClinicaData } from '../components/ficha-clinica/ficha-clinica.component';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  /**
   * Genera un presupuesto en PDF para una ficha clínica
   * @param ficha Datos de la ficha clínica
   * @param logoUrl URL del logo a incluir en el PDF
   */
  generateBudgetPdf(ficha: FichaClinicaData, logoUrl: string): void {
    // Crear un nuevo documento PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Cargar el logo como imagen
    if (logoUrl) {
      const img = new Image();
      img.onload = () => {
        try {
          // Convertir la imagen a base64
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          
          // Añadir la imagen al PDF en la parte superior izquierda con tamaño reducido
          const logoWidth = 25;
          const logoHeight = 25;
          doc.addImage(dataUrl, 'PNG', 15, 15, logoWidth, logoHeight);
          
          // Continuar con la generación del PDF
          this.completePdfGeneration(doc, ficha, pageWidth, pageHeight);
        } catch (error) {
          console.error('Error al procesar el logo:', error);
          // Si hay error con el logo, continuar sin él
          this.completePdfGeneration(doc, ficha, pageWidth, pageHeight);
        }
      };
      
      img.onerror = () => {
        console.error('Error al cargar el logo');
        // Si hay error al cargar el logo, continuar sin él
        this.completePdfGeneration(doc, ficha, pageWidth, pageHeight);
      };
      
      // Iniciar la carga de la imagen
      img.src = logoUrl;
    } else {
      // Si no hay URL de logo, continuar sin él
      this.completePdfGeneration(doc, ficha, pageWidth, pageHeight);
    }
  }
  
  // Método para completar la generación del PDF después de cargar el logo
  private completePdfGeneration(doc: jsPDF, ficha: FichaClinicaData, pageWidth: number, pageHeight: number): void {

    // Título del documento - alineado a la derecha del logo
    doc.setFontSize(22);
    doc.setTextColor(0, 102, 204); // Color azul para el título
    doc.text('PRESUPUESTO ODONTOLÓGICO', pageWidth - 15, 30, { align: 'right' });
    
    // Información de la clínica - alineada a la derecha
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100); // Color gris para la información de contacto
    doc.text('Clínica Dental - Atención Especializada', pageWidth - 15, 40, { align: 'right' });
    doc.text('Teléfono: +56 9 1234 5678 | Email: contacto@clinicadental.cl', pageWidth - 15, 45, { align: 'right' });
    doc.text('Dirección: Av. Principal 123, Santiago, Chile', pageWidth - 15, 50, { align: 'right' });
    
    // Línea separadora
    doc.setDrawColor(0, 102, 204); // Color azul para la línea
    doc.setLineWidth(0.5);
    doc.line(15, 60, pageWidth - 15, 60);
    
    // Información del paciente
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Paciente: ${ficha.patient.name || 'No especificado'}`, 15, 70);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 15, 75);
    doc.text(`Ficha Clínica #: ${ficha._id.substring(0, 8)}`, pageWidth - 15, 70, { align: 'right' });
    doc.text(`Dentista: ${ficha.dentist || 'No especificado'}`, pageWidth - 15, 75, { align: 'right' });
    
    // Preparar datos para la tabla de tratamientos
    const tableData = ficha.treatments.map(treatment => [
      treatment.diagnosis,
      treatment.toothNumber,
      treatment.treatment,
      new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(treatment.price || 0),
      treatment.status
    ]);
    
    // Añadir tabla de tratamientos
    autoTable(doc, {
      startY: 90,
      head: [['Diagnóstico', 'Pieza Dental', 'Tratamiento', 'Precio', 'Estado']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 102, 204],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      margin: { top: 85 }
    });
    
    // Calcular totales
    const totalPrice = ficha.totalPrice || 0;
    const totalDeposit = ficha.totalDeposit || 0;
    const balance = totalPrice - totalDeposit;
    
    // Añadir resumen financiero
    const finalY = (doc as any).lastAutoTable.finalY || 120;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Resumen Financiero:', pageWidth - 80, finalY + 20);
    
    doc.text(`Total Presupuesto:`, pageWidth - 80, finalY + 30);
    doc.text(`${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalPrice)}`, pageWidth - 15, finalY + 30, { align: 'right' });
    
    doc.text(`Abonado:`, pageWidth - 80, finalY + 40);
    doc.text(`${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalDeposit)}`, pageWidth - 15, finalY + 40, { align: 'right' });
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Saldo Pendiente:`, pageWidth - 80, finalY + 50);
    doc.text(`${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(balance)}`, pageWidth - 15, finalY + 50, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    
    // Añadir notas y condiciones
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Notas:', 15, finalY + 70);
    doc.text('- Este presupuesto tiene una validez de 30 días desde la fecha de emisión.', 15, finalY + 80);
    doc.text('- Los precios pueden variar según la complejidad del tratamiento.', 15, finalY + 85);
    doc.text('- Se requiere un abono del 30% para iniciar el tratamiento.', 15, finalY + 90);
    
    // Pie de página
    doc.setFontSize(8);
    doc.text('© Clínica Dental - Todos los derechos reservados', pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Guardar el PDF
    doc.save(`Presupuesto_${ficha.patient.name || 'Paciente'}_${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}
