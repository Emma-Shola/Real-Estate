import { useMemo, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Message = { role: 'user' | 'bot'; content: string };

const PublicChatbot = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: 'Hi, I can help with listings, pricing, locations, and inspections. What are you looking for?' },
  ]);

  const shouldShow = useMemo(() => {
    return location.pathname === '/' || location.pathname.startsWith('/listings') || location.pathname === '/inquiry';
  }, [location.pathname]);

  if (!shouldShow) return null;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || pending) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    try {
      setPending(true);
      const res = await api.post('/api/ai/chatbot-public', { message: text });
      const reply = res.data?.data?.reply || 'Could you share your preferred location and budget?';
      setMessages((prev) => [...prev, { role: 'bot', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: 'I could not process that right now. Please share your contact details and an agent will follow up.' },
      ]);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="w-[340px] max-w-[calc(100vw-2rem)] glass-card-elevated p-3 space-y-3 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Property Assistant</h3>
            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm p-2 rounded-lg ${
                  m.role === 'user' ? 'bg-primary text-primary-foreground ml-8' : 'bg-muted mr-8'
                }`}
              >
                {m.content}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about listings..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
            />
            <Button size="icon" onClick={handleSend} disabled={pending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setOpen(true)} className="rounded-full h-12 w-12 p-0 shadow-lg">
          <MessageCircle className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default PublicChatbot;

