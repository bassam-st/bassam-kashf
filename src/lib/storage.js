const STORAGE_KEY = 'tajer-customs-data-v1'

const sampleData = {
  clients: [
    {
      id: 'c1',
      name: 'عبدالله',
      phone: '777000111',
      notes: 'عميل تجريبي',
      ledgers: [
        {
          id: 'l1',
          title: 'كشف سيارة السائق مختار',
          bayanNo: '12345',
          driverName: 'مختار',
          carNo: '7 / 2345',
          operations: [
            {
              id: 'o1',
              date: '2026-05-20',
              statement: 'مبلغ البيان',
              currency: 'YER',
              amount: 50000,
              type: 'له',
              note: ''
            },
            {
              id: 'o2',
              date: '2026-05-21',
              statement: 'مبلغ الجودة',
              currency: 'YER',
              amount: 5000,
              type: 'عليه',
              note: ''
            },
            {
              id: 'o3',
              date: '2026-05-22',
              statement: 'سداد من العميل',
              currency: 'YER',
              amount: 10000,
              type: 'عليه',
              note: 'دفعة أولى'
            }
          ]
        }
      ]
    }
  ]
}

export const uid = () => Math.random().toString(36).slice(2, 10)

export function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return sampleData

  try {
    return JSON.parse(raw)
  } catch {
    return sampleData
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function withBalances(operations = []) {
  let balance = 0

  return operations.map((op) => {
    balance += op.type === 'له' ? Number(op.amount) : -Number(op.amount)
    return {
      ...op,
      balance
    }
  })
}

export function exportBackup(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'tajer-backup.json'
  a.click()
  URL.revokeObjectURL(url)
}

export function importBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        resolve(JSON.parse(e.target.result))
      } catch {
        reject(new Error('ملف JSON غير صالح'))
      }
    }

    reader.onerror = reject
    reader.readAsText(file)
  })
}
