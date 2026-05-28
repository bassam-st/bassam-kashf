import { useEffect, useMemo, useRef, useState } from 'react'
import AppHeader from './components/AppHeader'
import BottomNav from './components/BottomNav'
import Dashboard from './components/Dashboard'
import CustomersPage from './components/CustomersPage'
import CustomerDetailsPage from './components/CustomerDetailsPage'
import StatementPage from './components/StatementPage'
import ReportsPage from './components/ReportsPage'
import SettingsPage from './components/SettingsPage'
import ConfirmDialog from './components/ConfirmDialog'
import { createBackupData, downloadJsonFile, restoreBackupData } from './components/storage'

const STORAGE_KEY = 'customs-ledger-v1'

const seedData = {
  customers: [
    {
      id: crypto.randomUUID(),
      name: 'عبدالله',
      phone: '777000111',
      notes: 'عميل دائم - تخليص سيارات وارد',
      statements: [
        {
          id: crypto.randomUUID(),
          title: 'كشف سيارة السائق مختار',
          statementNumber: '12345',
          driverName: 'مختار',
          vehicleNumber: 'ج م ر 4581',
          transactions: [
            {
              id: crypto.randomUUID(),
              date: '2026-05-20',
              item: 'مبلغ البيان',
              currency: 'YER',
              amount: 250000,
              type: 'عليه',
              note: '',
            },
            {
              id: crypto.randomUUID(),
              date: '2026-05-21',
              item: 'مبلغ الجودة',
              currency: 'YER',
              amount: 15000,
              type: 'عليه',
              note: '',
            },
            {
              id: crypto.randomUUID(),
              date: '2026-05-22',
              item: 'سداد من العميل',
              currency: 'YER',
              amount: 100000,
              type: 'له',
              note: 'دفعة أولى',
            },
          ],
        },
        {
          id: crypto.randomUUID(),
          title: 'كشف سيارة السائق حسين',
          statementNumber: '67890',
          driverName: 'حسين',
          vehicleNumber: 'ن ق ل 2190',
          transactions: [],
        },
      ],
    },
  ],
}

function calculateRunningBalance(transactions) {
  let balance = 0
  return transactions.map((tx) => {
    balance += tx.type === 'له' ? -Number(tx.amount || 0) : Number(tx.amount || 0)
    return { ...tx, balance }
  })
}

function hydrateData(data) {
  return {
    customers: (data?.customers || []).map((customer) => ({
      ...customer,
      statements: (customer.statements || []).map((statement) => ({
        ...statement,
        transactions: calculateRunningBalance(statement.transactions || []),
      })),
    })),
  }
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return hydrateData(seedData)
    return hydrateData(JSON.parse(raw))
  } catch {
    return hydrateData(seedData)
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function findCustomer(data, customerId) {
  return data.customers.find((customer) => customer.id === customerId)
}

function findStatement(data, customerId, statementId) {
  return findCustomer(data, customerId)?.statements.find((statement) => statement.id === statementId)
}

export default function App() {
  const [data, setData] = useState(() => loadData())
  const [route, setRoute] = useState({ page: 'home', customerId: null, statementId: null })
  const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null })
  const fileInputRef = useRef(null)

  useEffect(() => {
    saveData(data)
  }, [data])

  const totals = useMemo(() => {
    const customersCount = data.customers.length
    const statementsCount = data.customers.reduce((acc, customer) => acc + customer.statements.length, 0)
    const transactionsCount = data.customers.reduce(
      (acc, customer) => acc + customer.statements.reduce((sum, statement) => sum + statement.transactions.length, 0),
      0,
    )
    const totalBalance = data.customers.reduce(
      (acc, customer) =>
        acc +
        customer.statements.reduce(
          (sum, statement) => sum + (statement.transactions.at(-1)?.balance || 0),
          0,
        ),
      0,
    )
    return { customersCount, statementsCount, transactionsCount, totalBalance }
  }, [data])

  const currentCustomer = route.customerId ? findCustomer(data, route.customerId) : null
  const currentStatement = route.customerId && route.statementId ? findStatement(data, route.customerId, route.statementId) : null

  const navigate = (page, params = {}) => {
    setRoute({ page, customerId: params.customerId ?? null, statementId: params.statementId ?? null })
  }

  const openConfirm = (title, message, onConfirm) => {
    setConfirmState({ open: true, title, message, onConfirm })
  }

  const closeConfirm = () => {
    setConfirmState({ open: false, title: '', message: '', onConfirm: null })
  }

  const upsertCustomer = (payload) => {
    setData((prev) => {
      if (payload.id) {
        return {
          customers: prev.customers.map((customer) =>
            customer.id === payload.id ? { ...customer, ...payload } : customer,
          ),
        }
      }
      return {
        customers: [
          {
            id: crypto.randomUUID(),
            name: payload.name,
            phone: payload.phone,
            notes: payload.notes,
            statements: [],
          },
          ...prev.customers,
        ],
      }
    })
  }

  const deleteCustomer = (customerId) => {
    openConfirm('حذف العميل', 'سيتم حذف العميل وكل الكشوفات والعمليات التابعة له نهائيًا.', () => {
      setData((prev) => ({ customers: prev.customers.filter((customer) => customer.id !== customerId) }))
      if (route.customerId === customerId) navigate('customers')
      closeConfirm()
    })
  }

  const upsertStatement = (customerId, payload) => {
    setData((prev) => ({
      customers: prev.customers.map((customer) => {
        if (customer.id !== customerId) return customer
        if (payload.id) {
          return {
            ...customer,
            statements: customer.statements.map((statement) =>
              statement.id === payload.id ? { ...statement, ...payload } : statement,
            ),
          }
        }
        return {
          ...customer,
          statements: [
            {
              id: crypto.randomUUID(),
              title: payload.title,
              statementNumber: payload.statementNumber,
              driverName: payload.driverName,
              vehicleNumber: payload.vehicleNumber,
              transactions: [],
            },
            ...customer.statements,
          ],
        }
      }),
    }))
  }

  const deleteStatement = (customerId, statementId) => {
    openConfirm('حذف الكشف', 'سيتم حذف الكشف وجميع العمليات الموجودة بداخله.', () => {
      setData((prev) => ({
        customers: prev.customers.map((customer) =>
          customer.id === customerId
            ? {
                ...customer,
                statements: customer.statements.filter((statement) => statement.id !== statementId),
              }
            : customer,
        ),
      }))
      if (route.statementId === statementId) navigate('customer', { customerId })
      closeConfirm()
    })
  }

  const upsertTransaction = (customerId, statementId, payload) => {
    setData((prev) => ({
      customers: prev.customers.map((customer) => {
        if (customer.id !== customerId) return customer
        return {
          ...customer,
          statements: customer.statements.map((statement) => {
            if (statement.id !== statementId) return statement
            const baseTransactions = statement.transactions.map(({ balance, ...rest }) => rest)
            const nextTransactions = payload.id
              ? baseTransactions.map((tx) => (tx.id === payload.id ? { ...tx, ...payload } : tx))
              : [{ ...payload, id: crypto.randomUUID() }, ...baseTransactions]
            return { ...statement, transactions: calculateRunningBalance(nextTransactions) }
          }),
        }
      }),
    }))
  }

  const deleteTransaction = (customerId, statementId, transactionId) => {
    openConfirm('حذف العملية', 'هل أنت متأكد من حذف هذه العملية؟ سيتم تحديث الأرصدة التالية تلقائيًا.', () => {
      setData((prev) => ({
        customers: prev.customers.map((customer) => {
          if (customer.id !== customerId) return customer
          return {
            ...customer,
            statements: customer.statements.map((statement) => {
              if (statement.id !== statementId) return statement
              const nextTransactions = statement.transactions
                .filter((tx) => tx.id !== transactionId)
                .map(({ balance, ...rest }) => rest)
              return { ...statement, transactions: calculateRunningBalance(nextTransactions) }
            }),
          }
        }),
      }))
      closeConfirm()
    })
  }

  const handleExport = () => {
    downloadJsonFile('customs-ledger-backup.json', createBackupData(data))
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImport = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const imported = await restoreBackupData(file)
    if (imported) setData(hydrateData(imported))
    event.target.value = ''
  }

  const renderPage = () => {
    switch (route.page) {
      case 'customers':
        return (
          <CustomersPage
            customers={data.customers}
            onNavigateCustomer={(customerId) => navigate('customer', { customerId })}
            onSaveCustomer={upsertCustomer}
            onDeleteCustomer={deleteCustomer}
          />
        )
      case 'customer':
        return currentCustomer ? (
          <CustomerDetailsPage
            customer={currentCustomer}
            onBack={() => navigate('customers')}
            onOpenStatement={(statementId) => navigate('statement', { customerId: currentCustomer.id, statementId })}
            onSaveCustomer={upsertCustomer}
            onSaveStatement={(payload) => upsertStatement(currentCustomer.id, payload)}
            onDeleteCustomer={() => deleteCustomer(currentCustomer.id)}
            onDeleteStatement={(statementId) => deleteStatement(currentCustomer.id, statementId)}
          />
        ) : (
          <CustomersPage
            customers={data.customers}
            onNavigateCustomer={(customerId) => navigate('customer', { customerId })}
            onSaveCustomer={upsertCustomer}
            onDeleteCustomer={deleteCustomer}
          />
        )
      case 'statement':
        return currentCustomer && currentStatement ? (
          <StatementPage
            customer={currentCustomer}
            statement={currentStatement}
            onBack={() => navigate('customer', { customerId: currentCustomer.id })}
            onSaveStatement={(payload) => upsertStatement(currentCustomer.id, payload)}
            onDeleteStatement={() => deleteStatement(currentCustomer.id, currentStatement.id)}
            onSaveTransaction={(payload) => upsertTransaction(currentCustomer.id, currentStatement.id, payload)}
            onDeleteTransaction={(transactionId) => deleteTransaction(currentCustomer.id, currentStatement.id, transactionId)}
          />
        ) : (
          <CustomersPage
            customers={data.customers}
            onNavigateCustomer={(customerId) => navigate('customer', { customerId })}
            onSaveCustomer={upsertCustomer}
            onDeleteCustomer={deleteCustomer}
          />
        )
      case 'reports':
        return <ReportsPage data={data} />
      case 'settings':
        return (
          <SettingsPage
            onExport={handleExport}
            onImport={handleImportClick}
            onReset={() =>
              openConfirm('إعادة ضبط البيانات', 'سيتم حذف جميع البيانات الحالية وإرجاع البيانات التجريبية.', () => {
                setData(hydrateData(seedData))
                navigate('home')
                closeConfirm()
              })
            }
          />
        )
      case 'home':
      default:
        return <Dashboard totals={totals} customers={data.customers} onNavigate={navigate} />
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900" dir="rtl">
      <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
      <AppHeader route={route.page} />
      <main className="mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-6xl flex-col px-4 pb-24 pt-5 sm:px-6 lg:px-8">
        {renderPage()}
      </main>
      <BottomNav current={route.page} onNavigate={navigate} />
      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        onCancel={closeConfirm}
        onConfirm={confirmState.onConfirm}
      />
    </div>
  )
}
