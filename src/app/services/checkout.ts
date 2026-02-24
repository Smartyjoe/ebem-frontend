import { callStoreApi } from './wooStoreApi';

export interface AddressInput {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

export interface CheckoutPaymentMethod {
  name: string;
  payment_method_id: string;
  description?: string;
  supports?: string[];
}

export interface CheckoutState {
  paymentMethods: CheckoutPaymentMethod[];
}

export interface CheckoutSubmitResult {
  orderId?: number;
  status?: string;
  redirectUrl?: string;
  raw: unknown;
}

interface CheckoutResponse {
  payment_methods?: CheckoutPaymentMethod[];
}

interface CheckoutSubmitResponse {
  order_id?: number;
  status?: string;
  payment_result?: {
    payment_status?: string;
    redirect_url?: string;
  };
}

export async function fetchCheckoutState(): Promise<CheckoutState> {
  const { data } = await callStoreApi<CheckoutResponse>('/checkout');
  return {
    paymentMethods: data.payment_methods ?? [],
  };
}

export async function updateCheckoutCustomer(address: AddressInput): Promise<void> {
  await callStoreApi('/cart/update-customer', {
    method: 'POST',
    body: JSON.stringify({
      billing_address: address,
      shipping_address: address,
    }),
  });
}

export async function submitCheckout(input: { paymentMethodId: string; billingAddress: AddressInput }): Promise<CheckoutSubmitResult> {
  const { data } = await callStoreApi<CheckoutSubmitResponse>('/checkout', {
    method: 'POST',
    body: JSON.stringify({
      payment_method: input.paymentMethodId,
      billing_address: input.billingAddress,
      shipping_address: input.billingAddress,
    }),
  });

  return {
    orderId: data.order_id,
    status: data.status ?? data.payment_result?.payment_status,
    redirectUrl: data.payment_result?.redirect_url,
    raw: data,
  };
}
