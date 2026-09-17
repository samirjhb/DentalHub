import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsIn, MaxLength, MinLength } from 'class-validator';
import { Role } from '../../../shared/enums/role.enum';

const STAFF_ROLES = [
  Role.SUPER_ADMIN,
  Role.CLINIC_ADMIN,
  Role.RECEPTIONIST,
  Role.DENTIST,
  Role.HYGIENIST,
  Role.DENTAL_ASSISTANT,
];

export class CreateStaffDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @MinLength(3)
  @MaxLength(20)
  name: string;

  @ApiProperty()
  @MinLength(6)
  @MaxLength(20)
  password: string;

  @ApiProperty({ enum: STAFF_ROLES })
  @IsEnum(Role)
  @IsIn(STAFF_ROLES)
  role: Role;
}
