import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const totalUsers = await this.prisma.user.count();
    const totalTransactions = await this.prisma.transaction.count();
    const totalBudgets = await this.prisma.budget.count();

    return {
      totalUsers,
      totalTransactions,
      totalBudgets,
    };
  }
}
