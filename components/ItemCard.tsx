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
  { label: 'Rouge', value: '#fca5a5' },
  { label: 'Orange', value: '#fed7aa' },
];

interface Props {
  item: WidgetItem;
  onContentChange: (id: string, html: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export default function ItemRow({ item, onContentChange, onToggleComplete, onDelete }: Props) {
  const editableRef = useRef<HTMLDivElement>(null);

  // Set the initial content once when the row mounts, then let the DOM own it.
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
    <div className={`item-row item-row--${item.type} ${item.completed ? 'item-row--done' : ''}`}>
      {item.type !== 'note' && (
        <input
          type="checkbox"
          className="item-row__checkbox"
          checked={item.completed}
          onChange={(e) => onToggleComplete(item.id, e.target.checked)}
          aria-label="Marquer comme fait"
        />
      )}

      <div
        ref={editableRef}
        className="item-row__content"
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onContentChange(item.id, e.currentTarget.innerHTML)}
      />

      <div className="item-row__toolbar">
        {TEXT_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            title={`Texte ${c.label}`}
            className="item-row__swatch"
            style={{ backgroundColor: c.value }}
            onMouseDown={preventBlur}
            onClick={() => applyFormat('foreColor', c.value)}
          />
        ))}
        <span className="item-row__toolbar-sep" />
        {HIGHLIGHT_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            title={`Surlignage ${c.label}`}
            className="item-row__swatch item-row__swatch--highlight"
            style={{ backgroundColor: c.value }}
            onMouseDown={preventBlur}
            onClick={() => applyFormat('hiliteColor', c.value)}
          />
        ))}
      </div>

      <button
        type="button"
        className="item-row__delete"
        aria-label="Supprimer"
        onClick={() => onDelete(item.id)}
      >
        ✕
      </button>
    </div>
  );
}
