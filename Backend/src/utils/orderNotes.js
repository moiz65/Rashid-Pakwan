const KNOWN_PREFIXES = [
  'Delivery type:',
  'Address:',
  'Branch:',
  'Landmark:',
  'Payment:',
  'Alternate phone:',
  'Instructions:',
]

function isItemExtraLine(line) {
  return / addons: /.test(line) || / note: /.test(line)
}

function isKnownLine(line) {
  return KNOWN_PREFIXES.some((prefix) => line.startsWith(prefix)) || isItemExtraLine(line)
}

export function parseOrderNotes(notes) {
  const empty = {
    deliveryType: null,
    address: null,
    branch: null,
    landmark: null,
    payment: null,
    alternatePhone: null,
    instructions: null,
    other: null,
  }

  if (!notes?.trim()) return empty

  const lines = notes.split('\n').map((l) => l.trim()).filter(Boolean)
  const result = { ...empty }
  const otherLines = []

  for (const line of lines) {
    if (line.startsWith('Delivery type:')) {
      result.deliveryType = line.slice('Delivery type:'.length).trim()
    } else if (line.startsWith('Address:')) {
      result.address = line.slice('Address:'.length).trim()
    } else if (line.startsWith('Branch:')) {
      result.branch = line.slice('Branch:'.length).trim()
    } else if (line.startsWith('Landmark:')) {
      result.landmark = line.slice('Landmark:'.length).trim()
    } else if (line.startsWith('Payment:')) {
      result.payment = line.slice('Payment:'.length).trim()
    } else if (line.startsWith('Alternate phone:')) {
      result.alternatePhone = line.slice('Alternate phone:'.length).trim()
    } else if (line.startsWith('Instructions:')) {
      result.instructions = line.slice('Instructions:'.length).trim()
    } else if (!isKnownLine(line)) {
      otherLines.push(line)
    }
  }

  result.other = otherLines.length ? otherLines.join('\n') : null
  return result
}

export function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '')
}
