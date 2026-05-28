import { useEffect, useState } from 'react'

const emptyState = {
  date: new Date().toISOString().slice(0, 10),
  statement: '',
  currency: 'YER',
  amount: '',
  type: 'له',
  note: ''
}

export default function OperationForm({
  initialValues,
  onSave,
  onCancel,
  submitLabel = 'إضافة عملية / بند'
}) {
  const [form, setForm] = useState(emptyState)

  useEffect(() => {
    setForm(
      initialValues
        ? { ...initialValues, amount: String(initialValues.amount) }
        : emptyState
    )
  }, [initialValues])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.statement.trim() || !form.amount) return

    onSave({
      ...form,
      statement: form.statement.trim(),
      amount: Number(form.amount)
    })

    if (!initialValues) {
      setForm(emptyState)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-soft"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">التاريخ</label>
          <input
            type="date"
            className="w-full rounded-2xl border border-slate-200 px-3 py-3 outline-none focus:border-brand-500"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">العملة</label>
          <select
            className="w-full rounded-2xl border border-slate-200 px-3 py-3 outline-none focus:border-brand-500"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
          >
            <option value="YER">YER</option>
            <option value="SAR">SAR</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          اسم البند أو البيان
        </label>
        <input
          className="w-full rounded-2xl border border-slate-200 px-3 py-3 outline-none focus:border-brand-500"
          value={form.statement}
          onChange={(e) => setForm({ ...form, statement: e.target.value })}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">المبلغ</label>
          <input
            type="number"
            className="w-full rounded-2xl border border-slate-200 px-3 py-3 outline-none focus:border-brand-500"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">نوع العملية</label>
          <select
            className="w-full rounded-2xl border border-slate-200 px-3 py-3 outline-none focus:border-brand-500"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="له">له</option>
            <option value="عليه">عليه</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">ملاحظة اختيارية</label>
        <textarea
          rows="2"
          className="w-full rounded-2xl border border-slate-200 px-3 py-3 outline-none focus:border-brand-500"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-2xl bg-brand-500 px-4 py-3 font-bold text-white"
        >
          {submitLabel}
        </button>

        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 px-4 py-3 font-medium"
          >
            إلغاء
          </button>
        ) : null}
      </div>
    </form>
  )
}
