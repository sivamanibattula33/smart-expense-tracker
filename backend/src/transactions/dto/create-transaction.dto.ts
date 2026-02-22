import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum TxnType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export class CreateTransactionDto {
  @IsEnum(TxnType)
  @IsNotEmpty()
  type: TxnType;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  date?: string;
}
