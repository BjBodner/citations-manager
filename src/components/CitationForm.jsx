import { useEffect, useState } from 'react'

const empty = { publicationNumber: '', title: '', abstract: '', link: '', notes: '' }

export default function CitationForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(empty)

  useEffect(() => {
    setForm(initial ? { ...empty, ...initial } : empty)
  }, [initial])

  function update(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function submit(e) {
    e.preventDefault()
    if (!form.publicationNumber.trim() && !form.title.trim()) {
      alert('חובה למלא לפחות מספר פרסום או כותרת')
      return
    }
    onSave({
      publicationNumber: form.publicationNumber.trim(),
      title: form.title.trim(),
      abstract: form.abstract.trim(),
      link: form.link.trim(),
      notes: form.notes.trim()
    })
  }

  return (
    <form className="citation-form" onSubmit={submit}>
      <h3>{initial?.id ? 'עריכת ציטוט' : 'ציטוט חדש'}</h3>
      <label>
        מספר פרסום
        <input value={form.publicationNumber} onChange={e => update('publicationNumber', e.target.value)} autoFocus />
      </label>
      <label>
        כותרת
        <input value={form.title} onChange={e => update('title', e.target.value)} />
      </label>
      <label>
        תקציר
        <textarea rows={3} value={form.abstract} onChange={e => update('abstract', e.target.value)} />
      </label>
      <label>
        קישור
        <input type="url" value={form.link} onChange={e => update('link', e.target.value)} placeholder="https://" />
      </label>
      <label>
        הערות
        <textarea rows={2} value={form.notes} onChange={e => update('notes', e.target.value)} />
      </label>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">שמור</button>
        <button type="button" className="btn" onClick={onCancel}>ביטול</button>
      </div>
    </form>
  )
}
