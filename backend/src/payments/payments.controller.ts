import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateAbacatePixDto } from './dto/create-abacate-pix.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiBearerAuth()
  @Post('abacate/pix')
  @ApiOperation({ summary: 'Create a PIX charge for a purchase via AbacatePay' })
  @ApiResponse({ status: 201, description: 'PIX charge created successfully.' })
  @ApiResponse({ status: 404, description: 'Purchase not found.' })
  @UseGuards(AuthGuard('jwt'))
  async createPix(@Body() createAbacatePixDto: CreateAbacatePixDto) {
    return this.paymentsService.createAbacatePixCharge(createAbacatePixDto.purchaseId);
  }

  @Get(':purchaseId/status')
  @ApiOperation({ summary: 'Get payment status of a purchase' })
  @ApiResponse({ status: 200, description: 'Payment status returned successfully.' })
  @ApiResponse({ status: 404, description: 'Purchase not found.' })
  async getStatus(@Param('purchaseId') purchaseId: string) {
    return this.paymentsService.getPaymentStatus(purchaseId);
  }
}
