import { useState, useEffect } from 'react';
import { Plus, Search, Star, BookOpen } from 'lucide-react';
import { supabase, Card, UserCard } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function CardCollection() {
  const { user } = useAuth();
  const [cards, setCards] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState<Partial<Card>>({
    name: '',
    type_line: '',
    mana_cost: '',
    colors: [],
    color_identity: [],
    is_legendary: false,
  });

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    const { data, error } = await supabase
      .from('user_cards')
      .select('*, cards(*)')
      .eq('user_id', user?.id);

    if (!error && data) {
      setCards(data);
    }
    setLoading(false);
  };

  const addCardToCollection = async () => {
    const { data: cardData, error: cardError } = await supabase
      .from('cards')
      .insert([newCard])
      .select()
      .single();

    if (cardError) {
      alert('Error creating card: ' + cardError.message);
      return;
    }

    const { error: userCardError } = await supabase
      .from('user_cards')
      .insert([{ user_id: user?.id, card_id: cardData.id, quantity: 1 }]);

    if (userCardError) {
      alert('Error adding to collection: ' + userCardError.message);
      return;
    }

    setShowAddCard(false);
    setNewCard({ name: '', type_line: '', mana_cost: '', colors: [], color_identity: [], is_legendary: false });
    loadCards();
  };

  const filteredCards = cards.filter((uc) =>
    uc.cards?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getColorGradient = (colors?: string[]) => {
    if (!colors || colors.length === 0) return 'from-slate-600 to-slate-800';
    if (colors.includes('W')) return 'from-yellow-200 to-amber-300';
    if (colors.includes('U')) return 'from-blue-400 to-cyan-500';
    if (colors.includes('B')) return 'from-purple-900 to-slate-900';
    if (colors.includes('R')) return 'from-red-500 to-orange-600';
    if (colors.includes('G')) return 'from-green-500 to-emerald-600';
    return 'from-slate-600 to-slate-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            Your Collection
          </h2>
          <p className="text-slate-400 mt-1">{cards.length} cards in your vault</p>
        </div>
        <button
          onClick={() => setShowAddCard(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Card</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search your collection..."
          className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
        />
      </div>

      {showAddCard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border-2 border-cyan-500/30 shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-cyan-300 mb-4">Add New Card</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Card Name</label>
                <input
                  type="text"
                  value={newCard.name}
                  onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Type Line</label>
                <input
                  type="text"
                  value={newCard.type_line}
                  onChange={(e) => setNewCard({ ...newCard, type_line: e.target.value })}
                  placeholder="Legendary Creature - Human Wizard"
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Mana Cost</label>
                <input
                  type="text"
                  value={newCard.mana_cost}
                  onChange={(e) => setNewCard({ ...newCard, mana_cost: e.target.value })}
                  placeholder="{2}{U}{U}"
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="legendary"
                  checked={newCard.is_legendary}
                  onChange={(e) => setNewCard({ ...newCard, is_legendary: e.target.checked })}
                  className="w-4 h-4 text-cyan-500 bg-slate-900 border-slate-600 rounded focus:ring-cyan-500"
                />
                <label htmlFor="legendary" className="text-sm text-slate-300">
                  Legendary
                </label>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={addCardToCollection}
                  className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg"
                >
                  Add Card
                </button>
                <button
                  onClick={() => setShowAddCard(false)}
                  className="flex-1 py-2 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCards.map((uc) => (
          <div
            key={uc.id}
            className="group relative bg-slate-800/50 border-2 border-slate-700 rounded-2xl p-4 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/20"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${getColorGradient(uc.cards?.colors)} opacity-5 rounded-2xl`}></div>
            <div className="relative">
              {uc.cards?.is_legendary && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full p-1.5 shadow-lg">
                    <Star className="w-3 h-3 text-white" />
                  </div>
                </div>
              )}
              <h3 className="text-lg font-bold text-white mb-1">{uc.cards?.name}</h3>
              <p className="text-sm text-cyan-400 mb-2">{uc.cards?.mana_cost}</p>
              <p className="text-xs text-slate-400">{uc.cards?.type_line}</p>
              <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-xs text-slate-400">Quantity: {uc.quantity}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
            <BookOpen className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-slate-400">No cards found. Start building your collection!</p>
        </div>
      )}
    </div>
  );
}
