'use client';

import { FormEvent, useState } from 'react';

interface Props {
  onSearch: (korean: string) => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, loading }: Props) {
  const [input, setInput] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) onSearch(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="한국어 단어를 입력하세요 (예: 사랑)"
        maxLength={20}
        className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
      <button
        type="submit"
        disabled={loading || !input.trim()}
        className="rounded-xl bg-indigo-600 px-5 py-3 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? '검색 중…' : '검색'}
      </button>
    </form>
  );
}
