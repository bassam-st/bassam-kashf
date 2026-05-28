import { useEffect, useState } from 'react'

const emptyState = {
  name: '',
  phone: '',
  notes: ''
}

export default function ClientForm({
  initialValues,
  onSave,
  onCancel,
  submitLabel = 'حفظ العميل'
}) {
  const [form, setForm] = useState(emptyState)

  useEffect(() => {
    setForm(initialValues || emptyState)
  }, [initialValues])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return

    onSave({
      ...form,
      name: form.name.trim()
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
      <div>
        <label className="mb-1 block text-sm font-medium">اسم العميل</label>
        <input
          className="w-full rounded-2xl border border-slate-200 px-3 py-3 outline-none focus:border-brand-500"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">رقم الهاتف</label>
        <input
          className="w-full rounded-2xl border border-slate-200 px-3 py-3 outline-none focus:border-brand-500"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">ملاحظات</label>
        <textarea
          rows="3"
          className="w-full rounded-2xl border border-slate-200 px-3 py-3 outline-none focus:border-brand-500"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
