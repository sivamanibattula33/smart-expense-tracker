import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Readable } from 'stream';
import csvParser from 'csv-parser';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) { }

  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    const txn = await this.prisma.transaction.create({
      data: {
        ...createTransactionDto,
        userId,
        date: createTransactionDto.date
          ? new Date(createTransactionDto.date)
          : new Date(),
      },
    });

    this.checkBudgetAndNotify(userId, txn).catch(err => console.error('Push notification check failed', err));

    return txn;
  }

  private async checkBudgetAndNotify(userId: string, txn: any) {
    if (txn.type !== 'EXPENSE') return;

    const date = new Date(txn.date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const budget = await this.prisma.budget.findFirst({
      where: { userId, category: txn.category, month, year }
    });

    if (!budget) return;

    const allExpenses = await this.prisma.transaction.findMany({
      where: {
        userId,
        category: txn.category,
        type: 'EXPENSE',
        date: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1)
        }
      }
    });

    const totalSpent = allExpenses.reduce((sum, t) => sum + Number(t.amount), 0);

    // If total spent just crossed the limit with this transaction (or is generally over)
    if (totalSpent > Number(budget.limitAmount)) {
      await this.notificationsService.sendPushToUser(userId, {
        title: 'Budget Exceeded! 🚨',
        body: `You have spent ₹${totalSpent} on ${txn.category} this month, exceeding your limit of ₹${budget.limitAmount}.`,
        icon: '/icon-192.png'
      });
    }
  }

  findAllByUser(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const txn = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!txn) throw new NotFoundException('Transaction not found');
    return txn;
  }

  async update(
    id: string,
    userId: string,
    updateTransactionDto: UpdateTransactionDto,
  ) {
    await this.findOne(id, userId); // verify ownership
    return this.prisma.transaction.update({
      where: { id },
      data: updateTransactionDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // verify ownership
    return this.prisma.transaction.delete({
      where: { id },
    });
  }

  async removeAll(userId: string) {
    return this.prisma.transaction.deleteMany({
      where: { userId },
    });
  }

  async importCSV(userId: string, buffer: Buffer): Promise<{ count: number }> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from(buffer.toString('utf-8'));

      stream
        .pipe(csvParser())
        .on('data', (data: any) => {
          // Normalize headers (case-insensitive for robustness)
          const row: any = Object.fromEntries(
            Object.entries(data).map(([key, value]) => [key.trim().toLowerCase(), value])
          );

          if (!row.amount) return;

          const type = row.type?.toUpperCase() === 'INCOME' ? 'INCOME' : 'EXPENSE';
          const amountStr = String(row.amount);
          // Parse amount safely (handles formatting like ₹1,000.50 -> 1000.50)
          const amount = parseFloat(amountStr.replace(/[^0-9.-]+/g, ''));
          const date = row.date ? new Date(row.date) : new Date();
          const category = row.category || 'Others';
          const notes = row.description || row.notes || '';

          if (!isNaN(amount) && amount > 0) {
            results.push({
              userId,
              type,
              category,
              amount,
              notes,
              date: isNaN(date.getTime()) ? new Date() : date,
            });
          }
        })
        .on('end', async () => {
          try {
            if (results.length > 0) {
              const res = await this.prisma.transaction.createMany({
                data: results,
              });
              resolve({ count: res.count });
            } else {
              resolve({ count: 0 });
            }
          } catch (error: any) {
            reject(error);
          }
        })
        .on('error', (error: any) => {
          reject(error);
        });
    });
  }
}
