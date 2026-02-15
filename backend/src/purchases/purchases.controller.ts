import { Controller, Post, Body, Get, Param, Query, UseGuards } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('purchases')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PurchasesController {
    constructor(private readonly purchasesService: PurchasesService) { }

    @Get()
    findAll(@CurrentUser() user: any, @Query('page') page?: string, @Query('limit') limit?: string, @Query('status') status?: string) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        const limitNumber = limit ? parseInt(limit, 10) : 20;

        // Default to returning purchases (as a buyer)
        return this.purchasesService.findAllByBuyer(user.userId, pageNumber, limitNumber, status);
    }

    @Post()
    @Roles(UserRole.USER)
    create(@Body() createPurchaseDto: CreatePurchaseDto, @CurrentUser() user: any) {
        return this.purchasesService.create(createPurchaseDto, user.userId);
    }

    @Get('history')
    @Roles(UserRole.USER)
    getHistory(@CurrentUser() user: any) {
        return this.purchasesService.findAllByBuyer(user.userId);
    }

    @Get('sales')
    @Roles(UserRole.USER)
    getSales(@CurrentUser() user: any) {
        return this.purchasesService.findAllBySeller(user.userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser() user: any) {
        return this.purchasesService.findOne(id, user.userId);
    }
}
