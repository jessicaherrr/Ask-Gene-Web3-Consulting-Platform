'use client'

import { createBrowserClient } from '@supabase/ssr'

// Create client function
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Function to create consultation record
export async function createConsultationRecord(data: {
  id: string;
  client_id: string;
  consultant_id: string;
  scheduled_time: string;
  amount: number;
  status: string;
  transaction_hash?: string;
  contract_address?: string;
  notes?: string;
  duration_minutes: number;
  payment_method: string;
  stripe_payment_id?: string;
}) {
  try {
    const supabase = createClient();
    
    const { data: result, error } = await supabase
      .from('consultations')
      .insert([{
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating consultation:', error);
      throw error;
    }

    console.log('Consultation created:', result);
    return result;
  } catch (error) {
    console.error('Error in createConsultationRecord:', error);
    throw error;
  }
}

// Function to get consultant by ID
export async function getConsultantById(id: string) {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('consultants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error getting consultant:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getConsultantById:', error);
    throw error;
  }
}

// Function to get user consultations
export async function getUserConsultations(userId: string) {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .or(`client_id.eq.${userId},consultant_id.eq.${userId}`)
      .order('scheduled_time', { ascending: true });

    if (error) {
      console.error('Error getting consultations:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserConsultations:', error);
    throw error;
  }
}