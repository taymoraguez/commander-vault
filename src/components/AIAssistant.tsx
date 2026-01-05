import { useState } from 'react';
import { Send, Sparkles, Zap } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Welcome, Planeswalker! I'm your AI deck building assistant. I can help you with:\n\n• Suggesting cards for your Commander deck\n• Explaining color identity and deck synergies\n• Recommending card ratios (lands, ramp, removal, etc.)\n• Analyzing your deck's strategy\n\nWhat would you like to know about building your Commander deck?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const responses = [
        "Great question! For Commander decks, I recommend:\n\n• 36-38 lands for consistent mana\n• 10-12 ramp spells (Sol Ring, mana rocks, land ramp)\n• 8-10 card draw effects\n• 5-7 removal spells\n• 30-35 cards for your main strategy\n\nAdjust based on your commander's mana cost and strategy!",
        "Color identity is crucial in Commander! Your deck can only include cards with mana symbols that appear on your commander. For example:\n\n• A Atraxa deck (WUBG) can include all colors except red\n• Basic lands can go in any deck\n• Colorless cards work in any deck\n\nMake sure all lands can produce colors in your identity!",
        "Building around your commander is key! Consider:\n\n• What does your commander do best?\n• What cards amplify that strategy?\n• Include protection for your commander\n• Add ways to recast if removed\n• Build redundancy for key effects\n\nYour commander should be the centerpiece, but not the only win condition!",
        "For a balanced mana curve, aim for:\n\n• CMC 1-2: 8-12 cards (ramp, removal)\n• CMC 3-4: 15-20 cards (your engine)\n• CMC 5-6: 10-15 cards (big plays)\n• CMC 7+: 5-8 cards (finishers)\n\nLower curves are faster, higher curves need more ramp!"
      ];

      const assistantMessage: Message = {
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)]
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      <div className="bg-gradient-to-r from-slate-800 via-blue-900 to-slate-800 border-2 border-cyan-500/30 rounded-2xl p-6 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              AI Deck Advisor
            </h2>
            <p className="text-slate-300 text-sm">Your personal Commander building assistant</p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-slate-800/50 border-2 border-slate-700 rounded-2xl p-6 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'bg-slate-700/50 text-slate-100 border border-slate-600'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-400">AI Assistant</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-700/50 border border-slate-600 rounded-2xl px-4 py-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about deck building strategies..."
          className="flex-1 px-4 py-3 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Send className="w-5 h-5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
