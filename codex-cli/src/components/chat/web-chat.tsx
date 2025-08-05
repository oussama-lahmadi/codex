import React, { useEffect, useRef, useState } from 'react';
import type { ResponseItem } from 'openai/resources/responses/responses';
import { randomUUID } from 'node:crypto';

export default function WebChat(): JSX.Element {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ResponseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastResponseId, setLastResponseId] = useState('');
  const sessionIdRef = useRef('');

  useEffect(() => {
    sessionIdRef.current = randomUUID();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = prompt.trim();
    if (!text) return;
    setLoading(true);
    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          text,
        }),
      });
      const data = (await resp.json()) as {
        items: ResponseItem[];
        lastResponseId: string;
      };
      setMessages((prev) => [...prev, ...data.items]);
      setLastResponseId(data.lastResponseId);
    } finally {
      setLoading(false);
    }
    setPrompt('');
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>Codex Web Chat</h1>
      <div style={{ minHeight: '200px', border: '1px solid #ccc', padding: '0.5rem', marginBottom: '1rem' }}>
        {messages.map((m, idx) => (
          <pre key={idx} style={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(m, null, 2)}
          </pre>
        ))}
        {loading && <p>Thinking…</p>}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter prompt"
          style={{ width: '80%', padding: '0.5rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem', marginLeft: '0.5rem' }}>
          Send
        </button>
      </form>
    </div>
  );
}
