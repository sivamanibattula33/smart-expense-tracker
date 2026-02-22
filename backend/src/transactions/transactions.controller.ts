import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) { }

  @Post()
  create(
    @Request() req: any,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(
      req.user.userId,
      createTransactionDto,
    );
  }

  @Get()
  findAll(@Request() req: any) {
    return this.transactionsService.findAllByUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.transactionsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(
      id,
      req.user.userId,
      updateTransactionDto,
    );
  }

  @Delete('all')
  removeAll(@Request() req: any) {
    return this.transactionsService.removeAll(req.user.userId);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.transactionsService.remove(id, req.user.userId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (file.mimetype !== 'text/csv' && !file.originalname.toLowerCase().endsWith('.csv') && file.mimetype !== 'application/vnd.ms-excel') {
      throw new BadRequestException('Only CSV files are allowed');
    }
    return this.transactionsService.importCSV(req.user.userId, file.buffer);
  }
}
