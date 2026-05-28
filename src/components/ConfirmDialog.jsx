export default function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-soft">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{description}</p>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-rose-600 px-4 py-3 font-bold text-white"
          >
            تأكيد الحذف
          </button>

          <button
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-medium"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}
