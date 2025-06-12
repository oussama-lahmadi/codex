import React, { useState } from 'react';

export default function WebChat(): JSX.Element {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() === '') return;
    setMessages((prev) => [...prev, prompt]);
    setPrompt('');
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>Codex Web Chat</h1>
      <div style={{ minHeight: '200px', border: '1px solid #ccc', padding: '0.5rem', marginBottom: '1rem' }}>
        {messages.map((m, idx) => (
          <p key={idx}>{m}</p>
        ))}
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
