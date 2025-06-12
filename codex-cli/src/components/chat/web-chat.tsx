import React, { useEffect, useRef, useState } from 'react';
import type {
  ResponseItem,
  ResponseInputItem,
} from 'openai/resources/responses/responses';
import { AgentLoop } from '../../utils/agent/agent-loop';
import { ReviewDecision } from '../../utils/agent/review';
import type { ApprovalPolicy } from '../../approvals';

export default function WebChat(): JSX.Element {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ResponseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastResponseId, setLastResponseId] = useState('');
  const agentRef = useRef<AgentLoop | null>(null);

  // Create the agent loop once on mount
  useEffect(() => {
    const approvalPolicy: ApprovalPolicy = 'suggest';
    const agent = new AgentLoop({
      model: 'gpt-4',
      approvalPolicy,
      additionalWritableRoots: [],
      onItem: (item) => setMessages((prev) => [...prev, item]),
      onLoading: setLoading,
      getCommandConfirmation: async () => ({ review: ReviewDecision.YES }),
      onLastResponseId: setLastResponseId,
    });
    agentRef.current = agent;
    return () => agent.terminate();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = prompt.trim();
    if (!text || !agentRef.current) return;
    const inputItem: ResponseInputItem.Message = {
      type: 'message',
      role: 'user',
      content: [{ type: 'input_text', text }],
    };
    agentRef.current.run([inputItem], lastResponseId);
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
