import { useState, useEffect } from 'react';
import { Plus, Trash2, Layers, AlertCircle } from 'lucide-react';
import { supabase, Deck, DeckCard, Card } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function DeckBuilder() {
  const { user } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [deckCards, setDeckCards] = useState<DeckCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [availableCards, setAvailableCards] = useState<Card[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);

  useEffect(() => {
    loadDecks();
    loadAvailableCards();
  }, []);

  useEffect(() => {
    if (selectedDeck) {
      loadDeckCards();
    }
  }, [selectedDeck]);

  const loadDecks = async () => {
    const { data, error } = await supabase
      .from('decks')
      .select('*, cards(*)')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDecks(data);
    }
    setLoading(false);
  };

  const loadDeckCards = async () => {
    if (!selectedDeck) return;

    const { data, error } = await supabase
      .from('deck_cards')
      .select('*, cards(*)')
      .eq('deck_id', selectedDeck.id);

    if (!error && data) {
      setDeckCards(data);
    }
  };

  const loadAvailableCards = async () => {
    const { data, error } = await supabase
      .from('user_cards')
      .select('cards(*)')
      .eq('user_id', user?.id);

    if (!error && data) {
      setAvailableCards(data.map((uc) => uc.cards).filter(Boolean) as Card[]);
    }
  };

  const createDeck = async () => {
    const { data, error } = await supabase
      .from('decks')
      .insert([{ user_id: user?.id, name: newDeckName, description: '' }])
      .select()
      .single();

    if (!error && data) {
      setDecks([data, ...decks]);
      setShowCreateDeck(false);
      setNewDeckName('');
    }
  };

  const deleteDeck = async (deckId: string) => {
    const { error } = await supabase
      .from('decks')
      .delete()
      .eq('id', deckId);

    if (!error) {
      setDecks(decks.filter((d) => d.id !== deckId));
      if (selectedDeck?.id === deckId) {
        setSelectedDeck(null);
        setDeckCards([]);
      }
    }
  };

  const addCardToDeck = async (cardId: string) => {
    if (!selectedDeck) return;

    if (deckCards.length >= 100) {
      alert('Commander decks must have exactly 100 cards!');
      return;
    }

    const { error } = await supabase
      .from('deck_cards')
      .insert([{ deck_id: selectedDeck.id, card_id: cardId, quantity: 1 }]);

    if (!error) {
      loadDeckCards();
      setShowAddCard(false);
    } else {
      alert('Error: ' + error.message);
    }
  };

  const removeCardFromDeck = async (deckCardId: string) => {
    const { error } = await supabase
      .from('deck_cards')
      .delete()
      .eq('id', deckCardId);

    if (!error) {
      loadDeckCards();
    }
  };

  const cardCount = deckCards.reduce((sum, dc) => sum + (dc.quantity || 0), 0);
  const isValidCommander = cardCount === 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            Your Decks
          </h2>
          <button
            onClick={() => setShowCreateDeck(true)}
            className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg shadow-lg shadow-cyan-500/30 transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {decks.map((deck) => (
            <button
              key={deck.id}
              onClick={() => setSelectedDeck(deck)}
              className={`w-full text-left p-4 rounded-xl transition-all ${
                selectedDeck?.id === deck.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/50'
                  : 'bg-slate-800/50 border-2 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{deck.name}</h3>
                  {deck.cards && (
                    <p className="text-xs text-cyan-400 mt-1">
                      Commander: {deck.cards.name}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDeck(deck.id);
                  }}
                  className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                </button>
              </div>
            </button>
          ))}

          {decks.length === 0 && (
            <div className="text-center py-8 bg-slate-800/30 rounded-xl border-2 border-dashed border-slate-700">
              <Layers className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No decks yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        {selectedDeck ? (
          <div className="space-y-4">
            <div className="bg-slate-800/50 border-2 border-slate-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedDeck.name}</h2>
                  <p className="text-slate-400 text-sm mt-1">
                    {cardCount} / 100 cards
                  </p>
                </div>
                <button
                  onClick={() => setShowAddCard(true)}
                  disabled={cardCount >= 100}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Card</span>
                </button>
              </div>

              {!isValidCommander && cardCount > 0 && (
                <div className="flex items-center space-x-2 p-3 bg-yellow-500/10 border border-yellow-500/50 rounded-lg mb-4">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <p className="text-sm text-yellow-300">
                    Commander decks require exactly 100 cards
                  </p>
                </div>
              )}

              {isValidCommander && (
                <div className="flex items-center space-x-2 p-3 bg-green-500/10 border border-green-500/50 rounded-lg mb-4">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-sm text-green-300">
                    Deck is complete and ready to play!
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {deckCards.map((dc) => (
                <div
                  key={dc.id}
                  className="bg-slate-800/50 border-2 border-slate-700 rounded-xl p-4 hover:border-cyan-500/50 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{dc.cards?.name}</h3>
                      <p className="text-xs text-cyan-400 mt-1">{dc.cards?.mana_cost}</p>
                      <p className="text-xs text-slate-400 mt-1">{dc.cards?.type_line}</p>
                    </div>
                    <button
                      onClick={() => removeCardFromDeck(dc.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {deckCards.length === 0 && (
              <div className="text-center py-12 bg-slate-800/30 rounded-xl border-2 border-dashed border-slate-700">
                <p className="text-slate-400">No cards in this deck yet</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-96 bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-700">
            <div className="text-center">
              <Layers className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Select a deck to view details</p>
            </div>
          </div>
        )}
      </div>

      {showCreateDeck && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border-2 border-cyan-500/30 shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-cyan-300 mb-4">Create New Deck</h3>
            <input
              type="text"
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              placeholder="Enter deck name..."
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={createDeck}
                className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateDeck(false)}
                className="flex-1 py-2 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddCard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border-2 border-cyan-500/30 shadow-2xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-cyan-300 mb-4">Add Card to Deck</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => addCardToDeck(card.id)}
                  className="text-left p-4 bg-slate-900/50 border border-slate-700 rounded-lg hover:border-cyan-500/50 transition-all"
                >
                  <h4 className="font-semibold text-white">{card.name}</h4>
                  <p className="text-xs text-cyan-400 mt-1">{card.mana_cost}</p>
                  <p className="text-xs text-slate-400 mt-1">{card.type_line}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAddCard(false)}
              className="w-full mt-4 py-2 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
