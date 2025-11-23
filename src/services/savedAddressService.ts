import { supabase } from '@/integrations/supabase/client';

export interface SavedAddress {
  id: string;
  user_id: string;
  label: string;
  address_type: 'home' | 'work' | 'other';
  latitude: number;
  longitude: number;
  flat_number: string | null;
  building_name: string;
  landmark: string | null;
  complete_address: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressData {
  label: string;
  address_type: 'home' | 'work' | 'other';
  latitude: number;
  longitude: number;
  flat_number?: string;
  building_name: string;
  landmark?: string;
  complete_address: string;
  is_default?: boolean;
}

class SavedAddressService {
  /**
   * Get all saved addresses for the current user
   */
  async getUserAddresses(): Promise<SavedAddress[]> {
    const { data, error } = await supabase
      .from('saved_addresses')
      .select('*')
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved addresses:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get a specific address by ID
   */
  async getAddressById(id: string): Promise<SavedAddress | null> {
    const { data, error } = await supabase
      .from('saved_addresses')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching address:', error);
      return null;
    }

    return data;
  }

  /**
   * Get user's default address
   */
  async getDefaultAddress(): Promise<SavedAddress | null> {
    const { data, error } = await supabase
      .from('saved_addresses')
      .select('*')
      .eq('is_default', true)
      .eq('is_active', true)
      .single();

    if (error) {
      // No default address found is not an error
      return null;
    }

    return data;
  }

  /**
   * Create a new saved address
   */
  async createAddress(addressData: CreateAddressData): Promise<SavedAddress | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('saved_addresses')
      .insert({
        user_id: user.id,
        ...addressData,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating address:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update an existing address
   */
  async updateAddress(id: string, addressData: Partial<CreateAddressData>): Promise<SavedAddress | null> {
    const { data, error } = await supabase
      .from('saved_addresses')
      .update(addressData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating address:', error);
      throw error;
    }

    return data;
  }

  /**
   * Set an address as default
   */
  async setDefaultAddress(id: string): Promise<void> {
    const { error } = await supabase
      .from('saved_addresses')
      .update({ is_default: true })
      .eq('id', id);

    if (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  }

  /**
   * Soft delete an address
   */
  async deleteAddress(id: string): Promise<void> {
    const { error } = await supabase
      .from('saved_addresses')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }

  /**
   * Hard delete an address (permanent)
   */
  async permanentlyDeleteAddress(id: string): Promise<void> {
    const { error } = await supabase
      .from('saved_addresses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error permanently deleting address:', error);
      throw error;
    }
  }

  /**
   * Format address for display
   */
  formatAddress(address: SavedAddress): string {
    const parts = [];
    
    if (address.flat_number) parts.push(address.flat_number);
    parts.push(address.building_name);
    if (address.landmark) parts.push(address.landmark);
    parts.push(address.complete_address);

    return parts.filter(p => p).join(', ');
  }

  /**
   * Get address type icon emoji
   */
  getAddressTypeIcon(type: string): string {
    switch (type) {
      case 'home': return '🏠';
      case 'work': return '💼';
      default: return '📍';
    }
  }
}

export const savedAddressService = new SavedAddressService();

