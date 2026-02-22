import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
} from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetsController {
    constructor(private readonly budgetsService: BudgetsService) { }

    @Post()
    create(@Request() req: any, @Body() createBudgetDto: CreateBudgetDto) {
        return this.budgetsService.create(req.user.userId, createBudgetDto);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.budgetsService.findAllByUser(req.user.userId);
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.budgetsService.findOne(id, req.user.userId);
    }

    // Support both PUT and PATCH for editing budget limits
    @Put(':id')
    updatePut(
        @Request() req: any,
        @Param('id') id: string,
        @Body() updateBudgetDto: UpdateBudgetDto,
    ) {
        return this.budgetsService.update(id, req.user.userId, updateBudgetDto);
    }

    @Patch(':id')
    updatePatch(
        @Request() req: any,
        @Param('id') id: string,
        @Body() updateBudgetDto: UpdateBudgetDto,
    ) {
        return this.budgetsService.update(id, req.user.userId, updateBudgetDto);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.budgetsService.remove(id, req.user.userId);
    }
}
