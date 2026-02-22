import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBudgetDto {
  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  @IsNotEmpty()
  limitAmount: number;

  @IsNumber()
  @IsNotEmpty()
  month: number;

  @IsNumber()
  @IsNotEmpty()
  year: number;
}
