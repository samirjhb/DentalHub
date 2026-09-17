import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DiagnosticEvaluation,
  DiagnosticEvaluationSchema,
} from './schema/diagnostic-evaluation.schema';

// Módulo reducido a propósito: el controller/service originales eran un stub
// sin lógica real (nunca tocaban Mongo). Se eliminaron como código basura.
// Este módulo se conserva SOLO para mantener registrado el modelo Mongoose
// 'DiagnosticEvaluation', del cual `patient` depende (populate('evaluations')
// fallaría con MissingSchemaError si el modelo dejara de registrarse en algún
// lado). Implementación real: Fase 4.
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DiagnosticEvaluation.name,
        schema: DiagnosticEvaluationSchema,
      },
    ]),
  ],
})
export class DiagnosticEvaluationModule {}
