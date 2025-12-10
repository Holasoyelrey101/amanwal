import crypto from 'crypto';
import axios from 'axios';

/**
 * Script de prueba para diagnosticar la integración con Flow API
 * Ejecutar: npx ts-node backend/scripts/testFlowAPI.ts
 */

const FLOW_API_KEY = '22FDEF88-C58C-48BB-B5E0-95EE88E31L1F';
const FLOW_SECRET_KEY = 'aff5268f770652441ff9e1bd1391d10f462bf122';
const FLOW_API_URL = 'https://sandbox.flow.cl/api';

function generateSignature(params: Record<string, any>): string {
  const keys = Object.keys(params).sort();
  let stringToSign = '';
  keys.forEach((key) => {
    stringToSign += key + params[key];
  });
  console.log('   String para firmar:', stringToSign);
  const signature = crypto
    .createHmac('sha256', FLOW_SECRET_KEY)
    .update(stringToSign)
    .digest('hex');
  return signature;
}

async function testFlowAPI() {
  try {
    console.log('🧪 Iniciando prueba de Flow API\n');

    // Parámetros de prueba
    const paramsForSignature: Record<string, any> = {
      amount: 29990, // 29.990 CLP - monto mínimo típico
      apiKey: FLOW_API_KEY,
      commerceOrder: 'TEST-001', // Orden de prueba simple
      currency: 'CLP',
      email: 'test@example.com',
      subject: 'Pago de prueba',
      urlConfirmation: 'https://amanwal.com/api/payments/confirm',
      urlReturn: 'https://amanwal.com/api/payments/return/test',
    };

    console.log('📊 Parámetros para firma (ordenados alfabéticamente):');
    Object.keys(paramsForSignature).sort().forEach((key) => {
      console.log(`   ${key}: ${paramsForSignature[key]}`);
    });

    const signature = generateSignature(paramsForSignature);
    console.log('\n📝 Firma generada:', signature.substring(0, 30) + '...\n');

    // Parámetros finales con firma
    const params: Record<string, any> = {
      ...paramsForSignature,
      s: signature,
    };

    // Convertir a URLSearchParams como hace Flow
    const urlParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      urlParams.append(key, String(params[key]));
    });

    console.log('🔗 Request body (URLSearchParams):');
    console.log('   ' + urlParams.toString().substring(0, 100) + '...\n');

    // Intentar crear orden en Flow
    console.log('🔄 Enviando petición a Flow...');
    console.log(`   URL: ${FLOW_API_URL}/payment/create\n`);

    const response = await axios.post(
      `${FLOW_API_URL}/payment/create`,
      urlParams,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('✅ Respuesta de Flow recibida:');
    console.log('   Status:', response.status);
    console.log('   Data:', response.data);

    if (response.data.url && response.data.token) {
      const redirectUrl = `${response.data.url}?token=${response.data.token}`;
      console.log('\n🔗 URL de redirección construida:');
      console.log('   ' + redirectUrl);
    }
  } catch (error) {
    console.error('❌ Error durante prueba:');
    if (axios.isAxiosError(error)) {
      console.error('   Status:', error.response?.status);
      console.error('   Data:', error.response?.data);
      console.error('   Message:', error.message);
    } else {
      console.error('   Error:', error);
    }
  }
}

// Ejecutar
testFlowAPI();
