/**
 * The PayPal JS SDK attaches itself to `window`, so it has no module types.
 *
 * Only the surface this app uses is declared. Note what `createOrder` returns:
 * an order id the *server* created. The browser never builds an order or names
 * an amount — that was the shape of the payment bypass this replaced.
 */
export interface PayPalButtonsConfig {
  createOrder: () => Promise<string>;
  onApprove: (data: { orderID: string }) => Promise<void> | void;
  onCancel?: () => void;
  onError?: (error: unknown) => void;
}

export interface PayPalButtons {
  render: (target: HTMLElement) => void;
  close?: () => void;
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: PayPalButtonsConfig) => PayPalButtons;
    };
  }
}
