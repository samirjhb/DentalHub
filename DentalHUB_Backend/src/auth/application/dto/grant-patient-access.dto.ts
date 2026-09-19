import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsMongoId, IsOptional, MaxLength, MinLength } from 'class-validator';

export class GrantPatientAccessDto {
  @ApiProperty()
  @IsMongoId()
  patientId: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  // Solo requerida cuando no existe ya una cuenta Auth con ese email.
  @ApiProperty({ required: false })
  @IsOptional()
  @MinLength(6)
  @MaxLength(20)
  password?: string;
}
