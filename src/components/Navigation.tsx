import { Sparkles, BookOpen, Layers, MessageSquare, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  activeTab: 'collection' | 'decks' | 'ai';
  onTabChange: (tab: 'collection' | 'decks' | 'ai') => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { signOut, user } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border-b border-cyan-500/30 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Commander's Vault
              </span>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => onTabChange('collection')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'collection'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-cyan-300'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span className="font-medium">Collection</span>
              </button>

              <button
                onClick={() => onTabChange('decks')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'decks'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-cyan-300'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span className="font-medium">Decks</span>
              </button>

              <button
                onClick={() => onTabChange('ai')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'ai'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-cyan-300'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="font-medium">AI Assistant</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-400">{user?.email}</span>
            <button
              onClick={signOut}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 hover:bg-red-500/20 text-slate-300 hover:text-red-300 rounded-lg transition-all border border-slate-700 hover:border-red-500/50"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
