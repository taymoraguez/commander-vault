/*
  # Magic the Gathering Commander Deck Builder Schema

  ## Overview
  This migration creates the database structure for a Commander deck building application
  that allows users to collect cards and build 100-card Commander decks.

  ## New Tables

  ### `cards`
  Stores Magic the Gathering card information
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text, required) - Card name
  - `mana_cost` (text) - Mana cost notation (e.g., "{2}{U}{U}")
  - `type_line` (text) - Card type (e.g., "Legendary Creature — Human Wizard")
  - `oracle_text` (text) - Card rules text
  - `colors` (text[]) - Array of colors (W, U, B, R, G)
  - `color_identity` (text[]) - Color identity for Commander rules
  - `power` (text) - Creature power
  - `toughness` (text) - Creature toughness
  - `rarity` (text) - Card rarity
  - `set_code` (text) - Set abbreviation
  - `image_url` (text) - Card image URL
  - `is_legendary` (boolean) - Whether card is legendary
  - `created_at` (timestamptz) - Record creation time

  ### `user_cards`
  Tracks which cards users own in their collection
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `card_id` (uuid, foreign key to cards)
  - `quantity` (integer, default 1) - Number of copies owned
  - `created_at` (timestamptz)

  ### `decks`
  Stores user's Commander decks
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `name` (text, required) - Deck name
  - `commander_id` (uuid, foreign key to cards) - The commander card
  - `description` (text) - Deck description
  - `color_identity` (text[]) - Deck's color identity
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `deck_cards`
  Junction table for cards in decks
  - `id` (uuid, primary key)
  - `deck_id` (uuid, foreign key to decks)
  - `card_id` (uuid, foreign key to cards)
  - `quantity` (integer, default 1) - Usually 1 (singleton format)
  - `category` (text) - Card category (e.g., "ramp", "removal", "draw")
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only view and modify their own collections and decks
  - Cards table is readable by all authenticated users
*/

CREATE TABLE IF NOT EXISTS cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mana_cost text,
  type_line text,
  oracle_text text,
  colors text[],
  color_identity text[],
  power text,
  toughness text,
  rarity text,
  set_code text,
  image_url text,
  is_legendary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_id uuid REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, card_id)
);

CREATE TABLE IF NOT EXISTS decks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  commander_id uuid REFERENCES cards(id) ON DELETE SET NULL,
  description text DEFAULT '',
  color_identity text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deck_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id uuid REFERENCES decks(id) ON DELETE CASCADE NOT NULL,
  card_id uuid REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  category text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(deck_id, card_id)
);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deck_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cards are viewable by all authenticated users"
  ON cards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own card collection"
  ON user_cards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add cards to collection"
  ON user_cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own card collection"
  ON user_cards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove cards from collection"
  ON user_cards FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own decks"
  ON decks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create decks"
  ON decks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decks"
  ON decks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own decks"
  ON decks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view cards in own decks"
  ON deck_cards FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM decks
    WHERE decks.id = deck_cards.deck_id
    AND decks.user_id = auth.uid()
  ));

CREATE POLICY "Users can add cards to own decks"
  ON deck_cards FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM decks
    WHERE decks.id = deck_cards.deck_id
    AND decks.user_id = auth.uid()
  ));

CREATE POLICY "Users can update cards in own decks"
  ON deck_cards FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM decks
    WHERE decks.id = deck_cards.deck_id
    AND decks.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM decks
    WHERE decks.id = deck_cards.deck_id
    AND decks.user_id = auth.uid()
  ));

CREATE POLICY "Users can remove cards from own decks"
  ON deck_cards FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM decks
    WHERE decks.id = deck_cards.deck_id
    AND decks.user_id = auth.uid()
  ));

CREATE INDEX IF NOT EXISTS idx_cards_name ON cards(name);
CREATE INDEX IF NOT EXISTS idx_cards_color_identity ON cards USING gin(color_identity);
CREATE INDEX IF NOT EXISTS idx_user_cards_user_id ON user_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_decks_user_id ON decks(user_id);
CREATE INDEX IF NOT EXISTS idx_deck_cards_deck_id ON deck_cards(deck_id);