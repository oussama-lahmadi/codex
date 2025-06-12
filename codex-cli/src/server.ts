import express from 'express';
import { AgentLoop } from './utils/agent/agent-loop';
import type {
  ResponseItem,
  ResponseInputItem,
} from 'openai/resources/responses/responses';
import { ReviewDecision } from './utils/agent/review';
import type { ApprovalPolicy } from './approvals';

const app = express();
app.use(express.json());

interface Session {
  agent: AgentLoop;
  lastResponseId: string;
  messages: ResponseItem[];
}

const sessions = new Map<string, Session>();

function getSession(id: string): Session {
  let session = sessions.get(id);
  if (!session) {
    session = {
      agent: {} as AgentLoop, // placeholder, replaced below
      lastResponseId: '',
      messages: [],
    };
    const approvalPolicy: ApprovalPolicy = 'suggest';
    session.agent = new AgentLoop({
      model: 'gpt-4',
      approvalPolicy,
      additionalWritableRoots: [],
      onItem: (item) => session!.messages.push(item),
      onLoading: () => {},
      getCommandConfirmation: async () => ({ review: ReviewDecision.YES }),
      onLastResponseId: (rid) => {
        session!.lastResponseId = rid;
      },
    });
    sessions.set(id, session);
  }
  return session;
}

app.post('/api/chat', async (req, res) => {
  const { sessionId, text } = req.body as { sessionId?: string; text: string };
  const sid = sessionId || 'default';
  const session = getSession(sid);
  const prevLen = session.messages.length;
  const input: ResponseInputItem.Message = {
    type: 'message',
    role: 'user',
    content: [{ type: 'input_text', text }],
  };
  await session.agent.run([input], session.lastResponseId);
  const newMessages = session.messages.slice(prevLen);
  res.json({ items: newMessages, lastResponseId: session.lastResponseId });
});

app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
});
