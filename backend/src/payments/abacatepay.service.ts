import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AbacatePayService {
  private readonly logger = new Logger(AbacatePayService.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ABACATEPAY_API_KEY') || '';
    this.apiUrl = this.configService.get<string>('ABACATEPAY_API_URL') || 'https://api.abacatepay.com/v2';
  }

  /**
   * Creates a customer in Abacate Pay or retrieves existing one if possible.
   * Only email is required.
   */
  async getOrCreateCustomer(buyer: { email: string; name: string; phone?: string }): Promise<string> {
    try {
      this.logger.log(`Gerenciando cliente no Abacate Pay para o email: ${buyer.email}`);
      const response = await fetch(`${this.apiUrl}/customers/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: buyer.email,
          name: buyer.name,
          cellphone: buyer.phone || undefined,
        }),
      });

      const result: any = await response.json();
      if (!response.ok) {
        this.logger.error(`Erro da API Abacate Pay ao criar cliente: ${JSON.stringify(result)}`);
        throw new Error(result.error || result.message || 'Erro desconhecido');
      }

      this.logger.log(`Cliente gerenciado com sucesso. ID: ${result.data.id}`);
      return result.data.id;
    } catch (error) {
      this.logger.error(`Falha ao criar/recuperar cliente no Abacate Pay: ${error.message}`);
      throw new InternalServerErrorException(`Erro no gateway de pagamento: ${error.message}`);
    }
  }

  /**
   * Creates a product in Abacate Pay.
   */
  async createProduct(params: {
    externalId: string;
    name: string;
    description: string;
    priceInCents: number;
    currency?: string;
  }): Promise<string> {
    try {
      this.logger.log(`Criando produto no Abacate Pay: externalId=${params.externalId}`);
      const response = await fetch(`${this.apiUrl}/products/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          externalId: params.externalId,
          name: params.name,
          description: params.description || undefined,
          price: params.priceInCents,
          currency: params.currency || 'BRL',
        }),
      });

      const result: any = await response.json();
      if (!response.ok) {
        this.logger.error(`Erro da API Abacate Pay ao criar produto: ${JSON.stringify(result)}`);
        throw new Error(result.error || result.message || 'Erro desconhecido');
      }

      this.logger.log(`Produto criado com sucesso no Abacate Pay. ID: ${result.data.id}`);
      return result.data.id;
    } catch (error) {
      this.logger.error(`Falha ao criar produto no Abacate Pay: ${error.message}`);
      throw new InternalServerErrorException(`Erro ao registrar produto no gateway: ${error.message}`);
    }
  }

  /**
   * Creates a checkout session for Pix and Card payments.
   */
  async createCheckout(params: {
    customerId: string;
    purchaseId: string;
    apProductId: string;
    paymentMethod: 'PIX' | 'CARD';
  }): Promise<string> {
    try {
      this.logger.log(`Criando checkout de pagamento para a compra: ${params.purchaseId}`);
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

      const payload = {
        customerId: params.customerId,
        externalId: params.purchaseId,
        frequency: 'ONE_TIME',
        // Select methods based on payment method selection
        methods: params.paymentMethod === 'PIX' ? ['PIX'] : ['PIX', 'CARD'],
        items: [
          {
            id: params.apProductId,
            quantity: 1,
          },
        ],
        returnUrl: `${frontendUrl}/buyer/history`,
        completionUrl: `${frontendUrl}/buyer/history?success=true`,
      };

      const response = await fetch(`${this.apiUrl}/checkouts/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result: any = await response.json();
      if (!response.ok) {
        this.logger.error(`Erro da API Abacate Pay ao criar checkout: ${JSON.stringify(result)}`);
        throw new Error(result.error || result.message || 'Erro desconhecido');
      }

      this.logger.log(`Sessão de checkout criada com sucesso. URL: ${result.data.url}`);
      return result.data.url;
    } catch (error) {
      this.logger.error(`Falha ao criar checkout no Abacate Pay: ${error.message}`);
      throw new InternalServerErrorException(`Erro ao gerar link de pagamento: ${error.message}`);
    }
  }
}
