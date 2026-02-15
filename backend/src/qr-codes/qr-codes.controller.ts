import { Controller, Get, Post, Param, Body, NotFoundException, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';

@Controller('qr-codes')
export class QrCodesController {
    constructor(private prisma: PrismaService) { }

    @Get(':productId')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async getQRCode(@Param('productId') productId: string) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new NotFoundException('Product not found');
        }
        // Return Base64 QR code pointing to the frontend product page
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const productUrl = `${frontendUrl}/product/${product.id}`;

        return {
            url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(productUrl)}`,
            code: product.qrCode,
            productUrl
        };
    }

    @Post('scan')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async scanQRCode(@Body() data: { qrCode: string }) {
        // Try to find by qrCode field first
        let product = await this.prisma.product.findUnique({
            where: { qrCode: data.qrCode },
            include: { seller: true }
        });

        // If not found, try to find by ID (in case the QR code contains the product ID)
        if (!product) {
            product = await this.prisma.product.findUnique({
                where: { id: data.qrCode },
                include: { seller: true }
            });
        }

        if (!product) {
            throw new NotFoundException('Invalid QR Code');
        }

        return {
            product,
            seller: product.seller
        };
    }
}
