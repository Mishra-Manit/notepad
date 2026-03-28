"use client";

import { useEffect, useRef, useState } from "react";

import type { Tab } from "@/types";

interface TabBarProps {
  tabs: Tab[];
  activeId: string;
  renamingId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, label: string) => void;
}

interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  canDelete: boolean;
  isEditingInitially: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (label: string) => void;
}

function TabItem({
  tab,
  isActive,
  canDelete,
  isEditingInitially,
  onSelect,
  onDelete,
  onRename,
}: TabItemProps) {
  const [isEditing, setIsEditing] = useState(isEditingInitially);
  const [draft, setDraft] = useState(tab.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commit = () => {
    const label = draft.trim() || tab.label;
    setDraft(label);
    setIsEditing(false);
    onRename(label);
  };

  const cancel = () => {
    setDraft(tab.label);
    setIsEditing(false);
  };

  return (
    <div
      className={`group relative py-1 px-0.5 text-[11.5px] cursor-pointer select-none
        whitespace-nowrap transition-colors duration-200
        ${isActive ? "text-white/[0.72]" : "text-white/20 hover:text-white/[0.45]"}`}
      onClick={onSelect}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          className="bg-transparent border-0 outline-none p-0 min-w-[4ch]
            text-[inherit] [font-size:inherit] [font-family:inherit]"
          value={draft}
          style={{ width: `${Math.max(4, draft.length + 2)}ch` }}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            } else if (e.key === "Escape") {
              e.preventDefault();
              cancel();
            }
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          onDoubleClick={(e) => {
            e.stopPropagation();
            setDraft(tab.label);
            setIsEditing(true);
          }}
        >
          {tab.label}
        </span>
      )}
      {canDelete && (
        <button
          className="inline-block ml-[5px] opacity-0 group-hover:opacity-100
            transition-opacity duration-150 text-[10px] leading-none
            text-white/30 hover:text-white/[0.55] bg-transparent border-0
            cursor-pointer p-0 align-middle"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`Delete ${tab.label}`}
        >
          x
        </button>
      )}
    </div>
  );
}

export function TabBar({
  tabs,
  activeId,
  renamingId,
  onSelect,
  onAdd,
  onDelete,
  onRename,
}: TabBarProps) {
  return (
    <div className="flex items-center justify-center mb-5">
      {tabs.map((tab, i) => (
        <span key={tab.id} className="contents">
          {i > 0 && (
            <span
              className="text-[25px] text-white/[0.33] px-2.5 select-none leading-none"
              aria-hidden="true"
            >
              &middot;
            </span>
          )}
          <TabItem
            tab={tab}
            isActive={tab.id === activeId}
            canDelete={tabs.length > 1}
            isEditingInitially={tab.id === renamingId}
            onSelect={() => onSelect(tab.id)}
            onDelete={() => onDelete(tab.id)}
            onRename={(label) => onRename(tab.id, label)}
          />
        </span>
      ))}
      <button
        className="py-1 px-0.5 ml-2.5 text-[11.5px] leading-none text-white/15
          bg-transparent border-0 cursor-pointer transition-colors duration-200
          hover:text-white/[0.45]"
        onClick={onAdd}
        aria-label="Add tab"
      >
        +
      </button>
    </div>
  );
}
