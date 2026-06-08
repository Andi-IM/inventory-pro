'use client';

import { useState, useRef, useEffect, useId } from 'react';

interface SearchableComboboxProps {
  /** The form field name — passed via hidden input to Server Actions */
  name: string;
  /** Suggestion list rendered in the dropdown */
  options: string[];
  placeholder?: string;
  label?: string;
  /** Allow submitting a value that is not in the options list */
  allowNew?: boolean;
  required?: boolean;
  /** Uncontrolled initial value */
  defaultValue?: string;
}

export default function SearchableCombobox({
  name,
  options,
  placeholder = 'Type to search…',
  label,
  allowNew = true,
  required = false,
  defaultValue = '',
}: SearchableComboboxProps) {
  const uid = useId();
  const inputId = `combobox-${uid}`;

  const [query, setQuery] = useState(defaultValue);
  const [committed, setCommitted] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase())
  );

  const showCreate = allowNew && query.trim() && !options.includes(query.trim());

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function select(value: string) {
    setQuery(value);
    setCommitted(value);
    setIsOpen(false);
    setFocusedIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const items = [...filtered, ...(showCreate ? ['__new__'] : [])];
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        setFocusedIndex(0);
        e.preventDefault();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < filtered.length) {
        select(filtered[focusedIndex]);
      } else if (focusedIndex === filtered.length && showCreate) {
        select(query.trim());
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  }

  // Scroll focused item into view
  useEffect(() => {
    if (listRef.current && focusedIndex >= 0) {
      const el = listRef.current.children[focusedIndex] as HTMLElement;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex]);

  function highlight(text: string) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-transparent text-info fw-semibold p-0">
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    );
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Hidden input carries the committed value to the Server Action */}
      <input type="hidden" name={name} value={committed || query} />

      {label && (
        <label htmlFor={inputId} className="form-label text-white-50 small mb-1">
          {label}
        </label>
      )}

      {/* Visible search input */}
      <div className="position-relative">
        <input
          id={inputId}
          type="text"
          value={query}
          required={required}
          autoComplete="off"
          placeholder={placeholder}
          className="form-control form-control-sm bg-dark text-white border-secondary border-opacity-50 pe-4"
          onChange={(e) => {
            setQuery(e.target.value);
            setCommitted('');
            setIsOpen(true);
            setFocusedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={`${inputId}-list`}
          role="combobox"
        />
        {/* Chevron icon */}
        <span
          className="position-absolute top-50 end-0 translate-middle-y pe-2 text-white-50"
          style={{ pointerEvents: 'none' }}
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>

      {/* Dropdown panel */}
      {isOpen && (
        <ul
          id={`${inputId}-list`}
          ref={listRef}
          role="listbox"
          className="list-unstyled mb-0 position-absolute w-100 border border-secondary border-opacity-50 rounded-2 overflow-auto shadow"
          style={{
            top: 'calc(100% + 4px)',
            zIndex: 1050,
            maxHeight: '200px',
            background: 'rgba(20, 24, 35, 0.97)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {filtered.length === 0 && !showCreate && (
            <li className="px-3 py-2 text-white-50 small">No matches found</li>
          )}

          {filtered.map((opt, i) => (
            <li
              key={opt}
              role="option"
              aria-selected={committed === opt}
              onMouseDown={() => select(opt)}
              onMouseEnter={() => setFocusedIndex(i)}
              className="px-3 py-2 small d-flex align-items-center justify-content-between"
              style={{
                cursor: 'pointer',
                background:
                  focusedIndex === i
                    ? 'rgba(99, 102, 241, 0.2)'
                    : committed === opt
                    ? 'rgba(99, 102, 241, 0.1)'
                    : 'transparent',
                color: committed === opt ? 'var(--bs-info)' : 'var(--bs-white)',
                transition: 'background 0.1s',
              }}
            >
              <code style={{ fontSize: '0.8rem' }}>{highlight(opt)}</code>
              {committed === opt && (
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </li>
          ))}

          {showCreate && (
            <li
              role="option"
              aria-selected={false}
              onMouseDown={() => select(query.trim())}
              onMouseEnter={() => setFocusedIndex(filtered.length)}
              className="px-3 py-2 small border-top border-secondary border-opacity-25"
              style={{
                cursor: 'pointer',
                background: focusedIndex === filtered.length ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: 'var(--bs-info)',
                transition: 'background 0.1s',
              }}
            >
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="me-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create <strong>&quot;{query.trim()}&quot;</strong>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
