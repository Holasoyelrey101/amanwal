import crypto from 'crypto';
import axios, { AxiosError } from 'axios';

interface FlowPaymentParams {
  commerceOrder: string;
  subject: string;
  currency?: string;
  amount: number;
  email: string;
  urlConfirmation: string;
  urlReturn: string;
}

interface FlowPaymentResponse {
  url: string;
  token: string;
  flowOrder: number;
}

interface FlowStatusResponse {
  flowOrder: number;
  commerceOrder: string;
  requestDate: string;
  status: number;
  subject: string;
  currency: string;
  amount: number;
  payer: string;
  paymentData?: {
    date: string;
    media: string;
    amount: number;
    currency: string;
    fee: number;
    balance: number;
  };
}

class FlowService {
  private apiKey: string;
  private secretKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.FLOW_API_KEY || '';
    this.secretKey = process.env.FLOW_SECRET_KEY || '';
    this.apiUrl = process.env.FLOW_API_URL || 'https://sandbox.flow.cl/api';

    console.log('🔑 Flow Service Iniciado');
    console.log('   API Key cargado:', !!this.apiKey);
    console.log('   Secret Key cargado:', !!this.secretKey);
    console.log('   API URL:', this.apiUrl);

    if (!this.apiKey || !this.secretKey) {
      throw new Error('Flow API credentials not configured in environment variables');
    }
  }

  /**
   * Genera firma HMAC-SHA256 para autenticar peticiones a Flow
   * Los parámetros deben estar ordenados alfabéticamente
   */
  private generateSignature(params: Record<string, any>): string {
    // Obtener las claves y ordenarlas alfabéticamente
    const keys = Object.keys(params).sort();

    // Concatenar los parámetros en formato: key1value1key2value2...
    let stringToSign = '';
    keys.forEach((key) => {
      stringToSign += key + params[key];
    });

    // Firmar con HMAC-SHA256
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(stringToSign)
      .digest('hex');

    return signature;
  }

  /**
   * Crea una orden de pago en Flow
   */
  async createPayment(paymentData: FlowPaymentParams): Promise<FlowPaymentResponse> {
    try {
      // Parámetros ORDENADOS ALFABÉTICAMENTE (SIN signature 's')
      // Según Flow: "Se deben firmar todos los parámetros menos el parámetro s"
      const paramsForSignature: Record<string, any> = {
        amount: Math.round(paymentData.amount),
        apiKey: this.apiKey,
        commerceOrder: paymentData.commerceOrder,
        currency: paymentData.currency || 'CLP',
        email: paymentData.email,
        subject: paymentData.subject,
        urlConfirmation: paymentData.urlConfirmation,
        urlReturn: paymentData.urlReturn,
      };

      // Generar firma de TODOS los parámetros (incluyendo apiKey, pero NO la firma 's')
      const signature = this.generateSignature(paramsForSignature);

      // Parámetros finales: todos + la firma
      const params: Record<string, any> = {
        ...paramsForSignature,
        s: signature,
      };

      console.log('🔄 Creando orden de pago en Flow...');
      console.log('   URL:', `${this.apiUrl}/payment/create`);
      console.log('   API Key:', this.apiKey);
      console.log('   Parámetros para firma (sin apiKey):', Object.keys(paramsForSignature).sort());
      console.log('   Signature:', signature.substring(0, 20) + '...');
      console.log('   Parámetros finales:', params);

      // Hacer petición POST a Flow usando data directa (axios convierte automáticamente)
      const response = await axios.post<FlowPaymentResponse>(
        `${this.apiUrl}/payment/create`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          transformRequest: [(data) => {
            // Transformar el objeto a URLSearchParams manualmente
            const params = new URLSearchParams();
            for (const key in data) {
              params.append(key, String(data[key]));
            }
            console.log('   Request body:', params.toString().substring(0, 150) + '...');
            return params.toString();
          }],
        }
      );

      console.log('✅ Orden de pago creada exitosamente');
      console.log('FlowOrder:', response.data.flowOrder);
      console.log('Token:', response.data.token);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Error en Flow API:', error.response?.data);
        throw new Error(`Flow API Error: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Verifica el estado de un pago usando el token
   */
  async getPaymentStatus(token: string): Promise<FlowStatusResponse> {
    try {
      const paramsForSignature: Record<string, any> = {
        apiKey: this.apiKey,
        token: token,
      };

      // Generar firma con apiKey y token
      const signature = this.generateSignature(paramsForSignature);

      // Parámetros finales con firma
      const params: Record<string, any> = {
        ...paramsForSignature,
        s: signature,
      };

      console.log('🔄 Verificando estado del pago...');

      // Hacer petición GET a Flow
      const response = await axios.get<FlowStatusResponse>(
        `${this.apiUrl}/payment/getStatus`,
        {
          params: params,
        }
      );

      console.log('✅ Estado del pago obtenido');
      console.log('Estado:', response.data.status);
      console.log('Monto:', response.data.amount);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Error al verificar estado:', error.response?.data);
        throw new Error(`Flow API Error: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Construye la URL de redirección para el usuario
   */
  buildRedirectUrl(paymentResponse: FlowPaymentResponse): string {
    return `${paymentResponse.url}?token=${paymentResponse.token}`;
  }

  /**
   * Verifica si un pago fue exitoso
   * Status 1 = Pago completado
   * Status 2 = Pago aprobado (también exitoso)
   * Status 0 = Pago pendiente
   * Status -1 = Pago rechazado
   * Status 3 = Pago rechazado (por Flow)
   */
  isPaymentSuccessful(status: number): boolean {
    return status === 1 || status === 2;
  }

  isPaymentPending(status: number): boolean {
    return status === 0;
  }

  isPaymentRejected(status: number): boolean {
    return status === -1 || status === 3;
  }
}

export default new FlowService();
