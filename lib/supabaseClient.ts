import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Person = 'stephan' | 'caroline';
export type ItemType = 'note' | 'tache' | 'rappel';

export interface WidgetItem {
  id: string;
  person: Person;
  type: ItemType;
  content: string;
  item_date: string;
  completed: boolean;
  created_at: string;
}
