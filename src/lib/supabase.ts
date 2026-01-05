import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Card {
  id: string;
  name: string;
  mana_cost?: string;
  type_line?: string;
  oracle_text?: string;
  colors?: string[];
  color_identity?: string[];
  power?: string;
  toughness?: string;
  rarity?: string;
  set_code?: string;
  image_url?: string;
  is_legendary?: boolean;
  created_at?: string;
}

export interface UserCard {
  id: string;
  user_id: string;
  card_id: string;
  quantity: number;
  created_at?: string;
  cards?: Card;
}

export interface Deck {
  id: string;
  user_id: string;
  name: string;
  commander_id?: string;
  description?: string;
  color_identity?: string[];
  created_at?: string;
  updated_at?: string;
  cards?: Card;
}

export interface DeckCard {
  id: string;
  deck_id: string;
  card_id: string;
  quantity: number;
  category?: string;
  created_at?: string;
  cards?: Card;
}
