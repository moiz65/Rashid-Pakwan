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

/**
 * Parse checkout-style notes packed by the website (and admin manual entry).
 */
export function parseOrderNotes(notes) {
  const empty = {
    deliveryType: null,
    address: null,
    branch: null,
    landmark: null,
    payment: null,
    alternatePhone: null,
    instructions: null,
    itemExtras: [],
    other: null,
    raw: notes || '',
  }

  if (!notes?.trim()) return empty

  const lines = notes.split('\n').map((l) => l.trim()).filter(Boolean)
  const result = { ...empty, itemExtras: [], raw: notes }
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
    } else if (isItemExtraLine(line)) {
      const addonsMatch = line.match(/^(.+?) addons: (.+)$/)
      const noteMatch = line.match(/^(.+?) note: (.+)$/)
      if (addonsMatch) {
        result.itemExtras.push({
          itemName: addonsMatch[1].trim(),
          type: 'addons',
          value: addonsMatch[2].trim(),
        })
      } else if (noteMatch) {
        result.itemExtras.push({
          itemName: noteMatch[1].trim(),
          type: 'note',
          value: noteMatch[2].trim(),
        })
      }
    } else if (!isKnownLine(line)) {
      otherLines.push(line)
    }
  }

  result.other = otherLines.length ? otherLines.join('\n') : null
  return result
}

/**
 * Build notes string for manual admin orders (same format as website).
 */
export function buildManualOrderNotes({ freeNotes = '', items = [] } = {}) {
  const lines = []

  if (freeNotes.trim()) {
    lines.push(freeNotes.trim())
  }

  for (const item of items) {
    const name = item.name?.trim()
    if (!name) continue

    if (item.addonNames?.length) {
      lines.push(`${name} addons: ${item.addonNames.join(', ')}`)
    }
    if (item.itemNote?.trim()) {
      lines.push(`${name} note: ${item.itemNote.trim()}`)
    }
  }

  return lines.length ? lines.join('\n') : undefined
}

export function getItemExtras(parsed, itemName) {
  if (!parsed?.itemExtras?.length || !itemName) return { addons: null, note: null }
  const extras = parsed.itemExtras.filter((e) => e.itemName === itemName)
  return {
    addons: extras.find((e) => e.type === 'addons')?.value || null,
    note: extras.find((e) => e.type === 'note')?.value || null,
  }
}
