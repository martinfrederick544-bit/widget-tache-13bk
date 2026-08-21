'use client';

import { useEffect, useState } from 'react';
import { supabase, type Person, type WidgetItem } from '@/lib/supabaseClient';

const TYPE_LABELS: Record<WidgetItem['type'], string> = {
  note: 'Note',
  tache: 'Tâche',
  rappel: 'Rappel',
};

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

interface Props {
  person: Person;
  targetDate: string;
  onClose: () => void;
  onCopy: (items: WidgetItem[]) => void;
}

export default function CarryOverPanel({ person, targetDate, onClose, onCopy }: Props) {
  const [sourceDate, setSourceDate] = useState(() => shiftDate(targetDate, -1));
  const [sourceItems, setSourceItems] = useState<WidgetItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setSelectedIds(new Set());
      const { data } = await supabase
        .from('widget_items')
        .select('*')
        .eq('person', person)
        .eq('item_date', sourceDate)
        .order('created_at', { ascending: true });
      if (!cancelled) {
        setSourceItems(data ?? []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [person, sourceDate]);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCopy = async () => {
    const toCopy = sourceItems.filter((it) => selectedIds.has(it.id));
    if (toCopy.length === 0) return;

    setCopying(true);
    const { data, error } = await supabase
      .from('widget_items')
      .insert(
        toCopy.map((it) => ({
          person,
          type: it.type,
          item_date: targetDate,
          content: it.content,
          completed: false,
        }))
      )
      .select();
    setCopying(false);

    if (!error && data) {
      onCopy(data);
      onClose();
    }
  };

  return (
    <div className="carry-panel">
      <div className="carry-panel__header">
        <span>Reporter depuis le</span>
        <input type="date" value={sourceDate} onChange={(e) => setSourceDate(e.target.value)} />
        <button type="button" className="carry-panel__close" aria-label="Fermer" onClick={onClose}>
          ✕
        </button>
      </div>

      {loading ? (
        <p className="board__empty">Chargement...</p>
      ) : sourceItems.length === 0 ? (
        <p className="board__empty">Rien à cette date.</p>
      ) : (
        <ul className="carry-panel__list">
          {sourceItems.map((it) => (
            <li key={it.id} className="carry-panel__item">
              <label>
                <input type="checkbox" checked={selectedIds.has(it.id)} onChange={() => toggle(it.id)} />
                <span className={`carry-panel__type carry-panel__type--${it.type}`}>{TYPE_LABELS[it.type]}</span>
                <span
                  className="carry-panel__preview"
                  dangerouslySetInnerHTML={{ __html: it.content || '<em>(vide)</em>' }}
                />
                {it.completed && <span className="carry-panel__done-tag">fait</span>}
              </label>
            </li>
          ))}
        </ul>
      )}

      <div className="carry-panel__footer">
        <button type="button" onClick={handleCopy} disabled={selectedIds.size === 0 || copying}>
          {copying ? 'Copie...' : `Copier ${selectedIds.size > 0 ? `(${selectedIds.size}) ` : ''}vers cette journée`}
        </button>
      </div>
    </div>
  );
}
