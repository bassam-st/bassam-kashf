import { useEffect, useState } from 'react'

const emptyState = {
  title: '',
  bayanNo: '',
  driverName: '',
  carNo: ''
}

export default function LedgerForm({
  initialValues,
  onSave,
  onCancel,
  submitLabel = 'حفظ الكشف'
}) {
  const [form, setForm] = useState(emptyState)

  useEffect(() => {
    setForm(initialValues || emptyState)
  }, [initialValues])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return

    onSave({
      ...form,
      title: form.title.trim()
    })

    if (!initialValues) {
      setForm(emptyState)
    }
  }

  const fields = [
    ['اسم الكشف', 'title'],
    ['رقم البيان', 'bayanNo'],
    ['اسم السائق', 'driverName'],
    ['رقم السيارة', 'carNo']
  ]

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-soft"
    >
      {fields.map(([label, key]) => (
        <div key={key}>
          <label className="mb-1 block text-sm font-medium">{label}</label>
          <input
            className="w-full rounded-2xl border border-slate-200 px-3 py-3 outline-none focus:border-brand-500"
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          />
        </div>
      ))}

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
