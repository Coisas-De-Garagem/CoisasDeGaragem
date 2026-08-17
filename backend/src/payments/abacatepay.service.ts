import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getErrorMessage } from '../common/error.util';

/** Standard envelope returned by the Abacate Pay API. */
export interface AbacatePayResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

/** Extracts a readable error message from an Abacate Pay response envelope. */
function responseError(result: AbacatePayResponse): string {
  return result.error || result.message || 'Erro desconhecido';
}

@Injectable()
export class AbacatePayService {
  private readonly logger = new Logger(AbacatePayService.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ABACATEPAY_API_KEY') || '';
    this.apiUrl =
      this.configService.get<string>('ABACATEPAY_API_URL') ||
      'https://api.abacatepay.com/v2';
  }

  /**
   * Creates a customer in Abacate Pay or retrieves existing one if possible.
   * Only email is required.
   */
  async getOrCreateCustomer(buyer: {
    email: string;
    name: string;
    phone?: string;
  }): Promise<string> {
    try {
      this.logger.log(
        `Gerenciando cliente no Abacate Pay para o email: ${buyer.email}`,
      );
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

      const result = (await response.json()) as AbacatePayResponse<{
        id: string;
      }>;
      if (!response.ok) {
        this.logger.error(
          `Erro da API Abacate Pay ao criar cliente: ${JSON.stringify(result)}`,
        );
        throw new Error(responseError(result));
      }

      this.logger.log(`Cliente gerenciado com sucesso. ID: ${result.data!.id}`);
      return result.data!.id;
    } catch (error) {
      const message = getErrorMessage(error);
      this.logger.error(
        `Falha ao criar/recuperar cliente no Abacate Pay: ${message}`,
      );
      throw new InternalServerErrorException(
        `Erro no gateway de pagamento: ${message}`,
      );
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
      this.logger.log(
        `Criando produto no Abacate Pay: externalId=${params.externalId}`,
      );
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

      const result = (await response.json()) as AbacatePayResponse<{
        id: string;
      }>;
      if (!response.ok) {
        this.logger.error(
          `Erro da API Abacate Pay ao criar produto: ${JSON.stringify(result)}`,
        );
        throw new Error(responseError(result));
      }

      this.logger.log(
        `Produto criado com sucesso no Abacate Pay. ID: ${result.data!.id}`,
      );
      return result.data!.id;
    } catch (error) {
      const message = getErrorMessage(error);
      this.logger.error(`Falha ao criar produto no Abacate Pay: ${message}`);
      throw new InternalServerErrorException(
        `Erro ao registrar produto no gateway: ${message}`,
      );
    }
  }

  /**
   * Creates a transparent Pix charge.
   */
  async createTransparentPix(params: {
    purchaseId: string;
    amountInCents: number;
    description: string;
    buyer: { email: string; name: string; phone?: string };
    expiresInSeconds: number;
  }): Promise<{ brCode: string; brCodeBase64: string; chargeId: string }> {
    try {
      this.logger.log(
        `Criando PIX transparente para a compra: ${params.purchaseId}`,
      );

      const payload = {
        method: 'PIX',
        data: {
          amount: params.amountInCents,
          expiresIn: params.expiresInSeconds,
          description: params.description,
          externalId: params.purchaseId,
        },
      };

      const response = await fetch(`${this.apiUrl}/transparents/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as AbacatePayResponse<{
        id: string;
        brCode: string;
        brCodeBase64: string;
      }>;
      if (!response.ok) {
        this.logger.error(
          `Erro da API Abacate Pay ao criar transparent: ${JSON.stringify(result)}`,
        );
        throw new Error(responseError(result));
      }

      this.logger.log(
        `PIX transparente criado com sucesso para compra ${params.purchaseId}`,
      );
      return {
        brCode: result.data!.brCode,
        brCodeBase64: result.data!.brCodeBase64,
        chargeId: result.data!.id,
      };
    } catch (error) {
      const message = getErrorMessage(error);
      this.logger.error(
        `Falha ao criar transparent PIX no Abacate Pay: ${message}`,
      );
      throw new InternalServerErrorException(
        `Erro ao gerar PIX transparente: ${message}`,
      );
    }
  }

  /**
   * Simulates a payment for a transparent checkout charge (Dev mode only).
   */
  async simulateTransparentPix(
    chargeId: string,
  ): Promise<AbacatePayResponse<unknown>> {
    try {
      this.logger.log(
        `Simulando pagamento no Abacate Pay para cobrança: ${chargeId}`,
      );
      const response = await fetch(
        `${this.apiUrl}/transparents/simulate-payment?id=${chargeId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      const result = (await response.json()) as AbacatePayResponse;
      if (!response.ok) {
        this.logger.error(
          `Erro da API Abacate Pay ao simular pagamento: ${JSON.stringify(result)}`,
        );
        throw new Error(responseError(result));
      }

      this.logger.log(
        `Simulação de pagamento enviada com sucesso para cobrança ${chargeId}`,
      );
      return result;
    } catch (error) {
      const message = getErrorMessage(error);
      this.logger.error(
        `Falha ao simular pagamento no Abacate Pay: ${message}`,
      );
      throw new InternalServerErrorException(
        `Erro ao simular pagamento: ${message}`,
      );
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
  }): Promise<{ url: string; id: string }> {
    try {
      this.logger.log(
        `Criando checkout de pagamento para a compra: ${params.purchaseId}`,
      );
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost:5173';

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
        expiresIn: 60, // Checkout expires in 60 seconds (for testing)
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

      const result = (await response.json()) as AbacatePayResponse<{
        url: string;
        id: string;
      }>;
      if (!response.ok) {
        this.logger.error(
          `Erro da API Abacate Pay ao criar checkout: ${JSON.stringify(result)}`,
        );
        throw new Error(responseError(result));
      }

      this.logger.log(
        `Sessão de checkout criada com sucesso. URL: ${result.data!.url}`,
      );
      return {
        url: result.data!.url,
        id: result.data!.id,
      };
    } catch (error) {
      const message = getErrorMessage(error);
      this.logger.error(`Falha ao criar checkout no Abacate Pay: ${message}`);
      throw new InternalServerErrorException(
        `Erro ao gerar link de pagamento: ${message}`,
      );
    }
  }
}
