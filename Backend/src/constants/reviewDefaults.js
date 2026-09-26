export const DEFAULT_REVIEW_SETTINGS = {
  id: 'revset_default',
  emailEnabled: false,
  whatsappEnabled: false,
  emailSubject: 'How was your order from {{restaurantName}}?',
  emailBodyTemplate:
    "Hi {{customerName}},\n\nThanks for ordering with us! We'd love your feedback on order {{orderId}}.\n\nLeave a review here: {{trackingUrl}}\n\nThank you!",
  whatsappTemplate:
    'Hi {{customerName}}! How was your order {{orderId}}? Share your review: {{trackingUrl}}',
  delayMinutes: 30,
  inviteOnDelivered: true,
}

export const REVIEW_STATUSES = ['pending', 'approved', 'rejected']
export const REVIEW_SOURCES = ['tracking', 'email', 'whatsapp']
