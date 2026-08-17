'use client';

import { useEffect, useRef } from 'react';
import type { WidgetItem } from '@/lib/supabaseClient';

const TEXT_COLORS = [
  { label: 'Noir', value: '#1f2933' },
  { label: 'Rouge', value: '#dc2626' },
  { label: 'Vert', value: '#16a34a' },
  { label: 'Bleu', value: '#2563eb' },
  { label: 'Orange', value: '#ea580c' },
];

const HIGHLIGHT_COLORS = [
  { label: 'Aucun', value: 'transparent' },
  { label: 'Jaune', value: '#fef08a' },
  { label: 'Rose', value: '#fbcfe8' },
  { label: 'Vert', value: '#bbf7d0' },
  { label: 'Bleu', value: '#bfdbfe' },
];

const TYPE_LABELS: Record<WidgetItem['type'], string> = {
  note: 'Note',
  tache: 'Tâche',
  rappel: 'Rappel',
};

interface Props {
  item: WidgetItem;
  accent: string;
  onContentChange: (id: string, html: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export default function ItemCard({ item, accent, onContentChange, onToggleComplete, onDelete }: Props) {
  const editableRef = useRef<HTMLDivElement>(null);

  // Set the initial content once when the card mounts, then let the DOM own it.
  // Re-writing innerHTML from React state on every keystroke resets the cursor
  // to the start of the element, which made typing appear reversed.
  useEffect(() => {
    if (editableRef.current) {
      editableRef.current.innerHTML = item.content;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  const applyFormat = (command: 'foreColor' | 'hiliteColor', value: string) => {
    editableRef.current?.focus();
    document.execCommand(command, false, value);
    if (editableRef.current) {
      onContentChange(item.id, editableRef.current.innerHTML);
    }
  };

  const preventBlur = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className={`item-card item-card--${item.type} ${item.completed ? 'item-card--done' : ''}`}>
      <div className="item-card__header">
        <span className="item-card__badge" style={{ backgroundColor: accent }}>
          {TYPE_LABELS[item.type]}
        </span>
        <div className="item-card__header-actions">
          {item.type !== 'note' && (
            <label className="item-card__checkbox">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={(e) => onToggleComplete(item.id, e.target.checked)}
              />
              Fait
            </label>
          )}
          <button
            type="button"
            className="item-card__delete"
            aria-label="Supprimer"
            onClick={() => onDelete(item.id)}
          >
            ✕
          </button>
        </div>
      </div>

      <div
        ref={editableRef}
        className="item-card__content"
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onContentChange(item.id, e.currentTarget.innerHTML)}
      />

      <div className="item-card__toolbar">
        <span className="item-card__toolbar-label">Texte</span>
        {TEXT_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            title={c.label}
            className="item-card__swatch"
            style={{ backgroundColor: c.value }}
            onMouseDown={preventBlur}
            onClick={() => applyFormat('foreColor', c.value)}
          />
        ))}
        <span className="item-card__toolbar-label">Surlignage</span>
        {HIGHLIGHT_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            title={c.label}
            className="item-card__swatch item-card__swatch--highlight"
            style={{ backgroundColor: c.value }}
            onMouseDown={preventBlur}
            onClick={() => applyFormat('hiliteColor', c.value)}
          />
        ))}
      </div>
    </div>
  );
}
