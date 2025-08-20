import { supabase } from '../lib/supabase';

export interface CustomCode {
  id: string;
  code: string;
  description: string;
  max_usage: number;
  current_usage: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  created_by: string;
  updated_at: string;
}

export interface CustomCodeUsage {
  id: string;
  code_id: string;
  customer_email: string;
  customer_name: string;
  used_at: string;
  ip_address?: string;
  user_agent?: string;
}

export interface CustomCodeStatistics {
  total_codes: number;
  active_codes: number;
  inactive_codes: number;
  expired_codes: number;
  total_max_usage: number;
  total_current_usage: number;
  created_this_month: number;
}

export class CustomCodeService {
  
  // Create a new custom code
  static async createCustomCode(
    code: string,
    description: string,
    maxUsage: number = 1,
    expiresAt?: Date,
    createdBy: string = 'admin'
  ): Promise<{ success: boolean; error?: string; data?: CustomCode }> {
    try {
      console.log(`🔄 Creating custom code: ${code}...`);
      
      const { data, error } = await supabase
        .from('custom_codes')
        .insert({
          code: code.toUpperCase(),
          description,
          max_usage: maxUsage,
          current_usage: 0,
          is_active: true,
          expires_at: expiresAt?.toISOString() || null,
          created_by: createdBy
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating custom code:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Custom code created:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Exception creating custom code:', error);
      return { success: false, error: 'Failed to create custom code' };
    }
  }

  // Get all custom codes
  static async getAllCustomCodes(): Promise<CustomCode[]> {
    try {
      const { data, error } = await supabase
        .from('custom_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting custom codes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception getting custom codes:', error);
      return [];
    }
  }

  // Get custom code by code string
  static async getCustomCodeByCode(code: string): Promise<CustomCode | null> {
    try {
      const { data, error } = await supabase
        .from('custom_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .maybeSingle();

      if (error) {
        console.error('Error getting custom code:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception getting custom code:', error);
      return null;
    }
  }

  // Update custom code
  static async updateCustomCode(
    id: string,
    updates: Partial<{
      description: string;
      max_usage: number;
      is_active: boolean;
      expires_at: string | null;
    }>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🔄 Updating custom code: ${id}...`);
      
      const { error } = await supabase
        .from('custom_codes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Error updating custom code:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Custom code updated');
      return { success: true };
    } catch (error) {
      console.error('❌ Exception updating custom code:', error);
      return { success: false, error: 'Failed to update custom code' };
    }
  }

  // Delete custom code
  static async deleteCustomCode(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🔄 Deleting custom code: ${id}...`);
      
      const { error } = await supabase
        .from('custom_codes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting custom code:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Custom code deleted');
      return { success: true };
    } catch (error) {
      console.error('❌ Exception deleting custom code:', error);
      return { success: false, error: 'Failed to delete custom code' };
    }
  }

  // Validate custom code (without using it)
  static async validateCustomCode(
    code: string
  ): Promise<{
    success: boolean;
    error?: string;
    data?: {
      code: CustomCode;
    };
  }> {
    try {
      console.log(`🔄 Validating custom code: ${code}...`);
      
      // First, get the custom code
      const customCode = await this.getCustomCodeByCode(code);
      console.log('🔍 Found custom code:', customCode);
      
      if (!customCode) {
        console.log('❌ Custom code not found');
        return { success: false, error: 'كود غير صحيح' };
      }

      console.log('📊 Code status:', {
        is_active: customCode.is_active,
        current_usage: customCode.current_usage,
        max_usage: customCode.max_usage,
        expires_at: customCode.expires_at,
        now: new Date().toISOString(),
        can_use: customCode.current_usage < customCode.max_usage
      });

      if (!customCode.is_active) {
        console.log('❌ Code is inactive');
        return { success: false, error: 'الكود معطل' };
      }

      if (customCode.expires_at && new Date(customCode.expires_at) < new Date()) {
        console.log('❌ Code has expired');
        return { success: false, error: 'الكود منتهي الصلاحية' };
      }

      if (customCode.current_usage >= customCode.max_usage) {
        console.log('❌ Code usage limit reached');
        return { success: false, error: 'تم استنفاذ عدد مرات استخدام الكود' };
      }

      console.log('✅ Code validation passed - ready for use');
      return { 
        success: true, 
        data: {
          code: customCode
        }
      };
    } catch (error) {
      console.error('❌ Exception validating custom code:', error);
      return { success: false, error: 'فشل في التحقق من الكود' };
    }
  }

  // Use custom code (consume one usage)
  static async useCustomCode(
    code: string,
    customerEmail: string,
    customerName: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{
    success: boolean;
    error?: string;
    data?: {
      code: CustomCode;
      usage: CustomCodeUsage;
    };
  }> {
    try {
      console.log(`🔄 Using custom code: ${code} for ${customerEmail}...`);
      
      // First, get the custom code
      const customCode = await this.getCustomCodeByCode(code);
      console.log('🔍 Found custom code:', customCode);
      
      if (!customCode) {
        console.log('❌ Custom code not found');
        return { success: false, error: 'كود غير صحيح' };
      }

      console.log('📊 Code status:', {
        is_active: customCode.is_active,
        current_usage: customCode.current_usage,
        max_usage: customCode.max_usage,
        expires_at: customCode.expires_at,
        now: new Date().toISOString(),
        can_use: customCode.current_usage < customCode.max_usage
      });

      if (!customCode.is_active) {
        console.log('❌ Code is inactive');
        return { success: false, error: 'الكود معطل' };
      }

      if (customCode.expires_at && new Date(customCode.expires_at) < new Date()) {
        console.log('❌ Code has expired');
        return { success: false, error: 'الكود منتهي الصلاحية' };
      }

      if (customCode.current_usage >= customCode.max_usage) {
        console.log('❌ Code usage limit reached');
        return { success: false, error: 'تم استنفاذ عدد مرات استخدام الكود' };
      }
      
      // Double-check: if we're at the limit, don't allow usage
      if (customCode.current_usage >= customCode.max_usage) {
        console.log('❌ Code usage limit reached (double-check)');
        return { success: false, error: 'تم استنفاذ عدد مرات استخدام الكود' };
      }

      console.log('✅ Code validation passed, attempting to use...');

      // Final check: ensure we won't exceed the limit
      if (customCode.current_usage >= customCode.max_usage) {
        console.log('❌ Code usage limit reached (final check)');
        return { success: false, error: 'تم استنفاذ عدد مرات استخدام الكود' };
      }

      // Insert usage record (this will trigger the validation trigger)
      const { data: usageData, error: usageError } = await supabase
        .from('custom_code_usage')
        .insert({
          code_id: customCode.id,
          customer_email: customerEmail,
          customer_name: customerName,
          ip_address: ipAddress,
          user_agent: userAgent
        })
        .select()
        .single();

      if (usageError) {
        console.error('❌ Error using custom code:', usageError);
        return { success: false, error: 'فشل في استخدام الكود' };
      }

      // Get updated custom code with new usage count
      const updatedCode = await this.getCustomCodeByCode(code);
      
      console.log('📊 Updated code after usage:', {
        original_usage: customCode.current_usage,
        updated_usage: updatedCode?.current_usage,
        max_usage: updatedCode?.max_usage,
        usage_incremented: updatedCode?.current_usage === customCode.current_usage + 1
      });
      
      console.log('✅ Custom code used successfully');
      return { 
        success: true, 
        data: {
          code: updatedCode!,
          usage: usageData
        }
      };
    } catch (error) {
      console.error('❌ Exception using custom code:', error);
      return { success: false, error: 'فشل في استخدام الكود' };
    }
  }

  // Get custom code statistics
  static async getStatistics(): Promise<CustomCodeStatistics> {
    try {
      const { data, error } = await supabase
        .from('custom_code_statistics')
        .select('*')
        .single();

      if (error) {
        console.error('Error getting custom code statistics:', error);
        return {
          total_codes: 0,
          active_codes: 0,
          inactive_codes: 0,
          expired_codes: 0,
          total_max_usage: 0,
          total_current_usage: 0,
          created_this_month: 0
        };
      }

      return data;
    } catch (error) {
      console.error('Exception getting custom code statistics:', error);
      return {
        total_codes: 0,
        active_codes: 0,
        inactive_codes: 0,
        expired_codes: 0,
        total_max_usage: 0,
        total_current_usage: 0,
        created_this_month: 0
      };
    }
  }

  // Get custom code usage history
  static async getUsageHistory(codeId?: string): Promise<CustomCodeUsage[]> {
    try {
      let query = supabase
        .from('custom_code_usage')
        .select(`
          *,
          custom_codes (
            code,
            description
          )
        `)
        .order('used_at', { ascending: false });

      if (codeId) {
        query = query.eq('code_id', codeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error getting custom code usage history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception getting custom code usage history:', error);
      return [];
    }
  }

  // Generate a random custom code
  static generateRandomCode(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Check if a code already exists
  static async isCodeExists(code: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('custom_codes')
        .select('id')
        .eq('code', code.toUpperCase())
        .maybeSingle();

      if (error) {
        console.error('Error checking if code exists:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Exception checking if code exists:', error);
      return false;
    }
  }
}
