'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase, type ItemType, type Person, type WidgetItem } from '@/lib/supabaseClient';
import ItemRow from './ItemCard';
import CarryOverPanel from './CarryOverPanel';

const SECTIONS: { type: ItemType; label: string; addLabel: string }[] = [
  { type: 'note', label: 'Notes', addLabel: '+ Note' },
  { type: 'tache', label: 'Tâches', addLabel: '+ Tâche' },
  { type: 'rappel', label: 'Rappels', addLabel: '+ Rappel' },
];

function todayIso(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

interface Props {
  person: Person;
  displayName: string;
  accent: string;
  accentSoft: string;
}

export default function Board({ person, displayName, accent, accentSoft }: Props) {
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [items, setItems] = useState<WidgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carryOpen, setCarryOpen] = useState(false);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('widget_items')
      .select('*')
      .eq('person', person)
      .eq('item_date', selectedDate)
      .order('created_at', { ascending: true });

    if (fetchError) {
      setError("Impossible de charger les éléments. Vérifie la configuration Supabase.");
      setItems([]);
    } else {
      setItems(data ?? []);
    }
    setLoading(false);
  }, [person, selectedDate]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const addItem = async (type: ItemType) => {
    const { data, error: insertError } = await supabase
      .from('widget_items')
      .insert({ person, type, item_date: selectedDate, content: '' })
      .select()
      .single();

    if (!insertError && data) {
      setItems((prev) => [...prev, data]);
    }
  };

  const handleContentChange = (id: string, html: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, content: html } : it)));

    if (saveTimers.current[id]) {
      clearTimeout(saveTimers.current[id]);
    }
    saveTimers.current[id] = setTimeout(async () => {
      await supabase.from('widget_items').update({ content: html }).eq('id', id);
    }, 600);
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, completed } : it)));
    await supabase.from('widget_items').update({ completed }).eq('id', id);
  };

  const handleDelete = async (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    await supabase.from('widget_items').delete().eq('id', id);
  };

  return (
    <div className="board" style={{ ['--accent' as string]: accent, ['--accent-soft' as string]: accentSoft }}>
      <header className="board__header">
        <h1>{displayName}</h1>
        <div className="board__date-controls">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button type="button" onClick={() => setSelectedDate(todayIso())}>
            Aujourd&apos;hui
          </button>
          <button type="button" onClick={() => setCarryOpen((v) => !v)}>
            ↩ Reporter des éléments
          </button>
        </div>
      </header>

      {carryOpen && (
        <CarryOverPanel
          person={person}
          targetDate={selectedDate}
          onClose={() => setCarryOpen(false)}
          onCopy={(newItems) => setItems((prev) => [...prev, ...newItems])}
        />
      )}

      <div className="board__actions">
        {SECTIONS.map((section) => (
          <button key={section.type} type="button" onClick={() => addItem(section.type)}>
            {section.addLabel}
          </button>
        ))}
      </div>

      {error && <p className="board__error">{error}</p>}

      {loading ? (
        <p className="board__empty">Chargement...</p>
      ) : items.length === 0 ? (
        <p className="board__empty">Rien pour cette journée. Ajoute une note, une tâche ou un rappel.</p>
      ) : (
        <div className="board__sections">
          {SECTIONS.map((section) => {
            const sectionItems = items.filter((it) => it.type === section.type);
            if (sectionItems.length === 0) return null;
            return (
              <div key={section.type} className={`type-section type-section--${section.type}`}>
                <h2 className="type-section__title">{section.label}</h2>
                <div className="type-section__list">
                  {sectionItems.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      onContentChange={handleContentChange}
                      onToggleComplete={handleToggleComplete}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
