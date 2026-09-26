export const loginCredentials = [
  { email: 'admin@restaurant.com', password: 'admin123', name: 'Admin User', role: 'admin' },
  { email: 'sarah@restaurant.com', password: 'manager123', name: 'Sarah Manager', role: 'manager' },
  { email: 'mike@restaurant.com', password: 'staff123', name: 'Mike Staff', role: 'staff' },
]

export function validateCredentials(email, password) {
  return loginCredentials.find(
    (c) => c.email.toLowerCase() === email.toLowerCase() && c.password === password
  ) ?? null
}
