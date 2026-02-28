import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEmail,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateSpecialistDto {
  @IsString()
  @MinLength(1, { message: 'Name must not be empty' })
  @MaxLength(255)
  name: string;

  @IsString()
  @MinLength(1, { message: 'ID number must not be empty' })
  @MaxLength(50)
  idNumber: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
