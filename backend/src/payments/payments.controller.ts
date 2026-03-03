import { Controller, Post, Get, Body, Param, UseGuards, Headers, Req, RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateAbacatePixDto } from './dto/create-abacate-pix.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

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

  @Post('abacate/webhook')
  @ApiOperation({ summary: 'Receive AbacatePay webhook notifications' })
  @ApiResponse({ status: 200, description: 'Webhook received and processed.' })
  async handleWebhook(
    @Body() body: any,
    @Headers('x-webhook-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    // Explicit cast to Buffer for the rawBody property provided by NestJS rawBody option
    return this.paymentsService.handleWebhook(body, signature, req.rawBody as Buffer);
  }
}
