export const DEFAULT_STATUS_MESSAGES = {
  pending: {
    label: 'Order Placed',
    message: 'Your order was placed. Waiting for the restaurant to receive it.',
    eta: '5-10 min',
  },
  confirmed: {
    label: 'Order Received',
    message: 'The restaurant has received your order and will prepare it soon.',
    eta: '20-30 min',
  },
  preparing: {
    label: 'Preparing',
    message: 'Our kitchen is preparing your order.',
    eta: '15-20 min',
  },
  delivered: {
    label: 'Delivered',
    message: 'Your order has been delivered. Enjoy!',
    eta: null,
  },
  rejected: {
    label: 'Rejected',
    message: 'Unfortunately your order could not be fulfilled.',
    eta: null,
  },
  cancelled: {
    label: 'Cancelled',
    message: 'This order has been cancelled.',
    eta: null,
  },
}

export const DEFAULT_TRACKING_SETTINGS = {
  id: 'tracking_default',
  restaurantName: 'Rashid Pakwan',
  phone: '+92 300 1234567',
  supportEmail: 'support@rashidpakwan.com',
  address: 'Main Branch, Karachi',
  logoUrl: null,
  helpText: 'Need help? Call us anytime during restaurant hours.',
  pollIntervalSeconds: 20,
  showRejectionReason: true,
  statusMessages: DEFAULT_STATUS_MESSAGES,
}

export const TRACKING_STEPS = ['pending', 'confirmed', 'preparing', 'delivered']
