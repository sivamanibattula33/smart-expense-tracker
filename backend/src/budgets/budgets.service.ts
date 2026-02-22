import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) { }

  async create(userId: string, createBudgetDto: CreateBudgetDto) {
    try {
      return await this.prisma.budget.create({
        data: {
          ...createBudgetDto,
          userId,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('A budget already exists for this specific category and month');
      }
      throw error;
    }
  }

  findAllByUser(userId: string) {
    return this.prisma.budget.findMany({
      where: { userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async findOne(id: string, userId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
    });
    if (!budget) throw new NotFoundException('Budget not found');
    return budget;
  }

  async update(id: string, userId: string, updateBudgetDto: UpdateBudgetDto) {
    await this.findOne(id, userId);
    return this.prisma.budget.update({
      where: { id },
      data: updateBudgetDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.budget.delete({
      where: { id },
    });
  }
}
