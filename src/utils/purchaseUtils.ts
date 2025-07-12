interface PurchaseData {
  hasCompletedPurchase: boolean;
  totalQuantity: number;
  usedCount: number;
  purchaseDate: string;
}

export const PurchaseUtils = {
  // Get purchase data from localStorage
  getPurchaseData(): PurchaseData {
    const defaultData: PurchaseData = {
      hasCompletedPurchase: false,
      totalQuantity: 0,
      usedCount: 0,
      purchaseDate: ''
    };

    try {
      const stored = localStorage.getItem('purchaseData');
      if (stored) {
        return { ...defaultData, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error reading purchase data:', error);
    }

    return defaultData;
  },

  // Save purchase data to localStorage
  savePurchaseData(data: PurchaseData): void {
    try {
      localStorage.setItem('purchaseData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving purchase data:', error);
    }
  },

  // Check if user has completed a purchase
  hasPurchased(): boolean {
    return this.getPurchaseData().hasCompletedPurchase;
  },

  // Mark user as having completed a purchase with quantity
  markAsPurchased(quantity: number = 1): void {
    const currentData = this.getPurchaseData();
    const newData: PurchaseData = {
      hasCompletedPurchase: true,
      totalQuantity: currentData.totalQuantity + quantity,
      usedCount: currentData.usedCount,
      purchaseDate: new Date().toISOString()
    };
    
    this.savePurchaseData(newData);
    
    // Trigger custom event for components to listen to
    window.dispatchEvent(new CustomEvent('purchaseCompleted'));
  },

  // Get remaining uses for growth system
  getRemainingUses(): number {
    const data = this.getPurchaseData();
    return Math.max(0, data.totalQuantity - data.usedCount);
  },

  // Check if user can use growth system
  canUseGrowthSystem(): boolean {
    return this.getRemainingUses() > 0;
  },

  // Use one growth system attempt
  useGrowthSystem(): boolean {
    const data = this.getPurchaseData();
    if (data.totalQuantity > data.usedCount) {
      const newData: PurchaseData = {
        ...data,
        usedCount: data.usedCount + 1
      };
      this.savePurchaseData(newData);
      
      // Trigger update event
      window.dispatchEvent(new CustomEvent('growthSystemUsed'));
      return true;
    }
    return false;
  },

  // Get usage statistics
  getUsageStats(): { total: number; used: number; remaining: number } {
    const data = this.getPurchaseData();
    return {
      total: data.totalQuantity,
      used: data.usedCount,
      remaining: this.getRemainingUses()
    };
  },

  // Get purchase date
  getPurchaseDate(): Date | null {
    const data = this.getPurchaseData();
    return data.purchaseDate ? new Date(data.purchaseDate) : null;
  },

  // Reset purchase status (for testing)
  resetPurchaseStatus(): void {
    localStorage.removeItem('purchaseData');
    localStorage.removeItem('hasCompletedPurchase'); // Legacy cleanup
    localStorage.removeItem('purchaseDate'); // Legacy cleanup
    
    // Trigger custom event for components to listen to
    window.dispatchEvent(new CustomEvent('purchaseReset'));
  },

  // Check if purchase was made within a certain number of days
  isPurchaseRecent(days: number = 30): boolean {
    const purchaseDate = this.getPurchaseDate();
    if (!purchaseDate) return false;
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - purchaseDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= days;
  }
};

// Add global dev tools for testing (only in development)
if (import.meta.env.DEV) {
  (window as any).purchaseUtils = {
    ...PurchaseUtils,
    // Helper functions for testing
    addQuantity: (quantity: number) => {
      const data = PurchaseUtils.getPurchaseData();
      const newData = {
        ...data,
        hasCompletedPurchase: true,
        totalQuantity: data.totalQuantity + quantity,
        purchaseDate: new Date().toISOString()
      };
      PurchaseUtils.savePurchaseData(newData);
      window.dispatchEvent(new CustomEvent('purchaseCompleted'));
      console.log(`Added ${quantity} uses. Total: ${newData.totalQuantity}, Used: ${newData.usedCount}, Remaining: ${newData.totalQuantity - newData.usedCount}`);
    },
    getStats: () => {
      const stats = PurchaseUtils.getUsageStats();
      console.log('Current Stats:', stats);
      return stats;
    }
  };
  console.log('Purchase Utils available in console as: purchaseUtils');
  console.log('Available commands:');
  console.log('- purchaseUtils.addQuantity(n) - Add n quantity/uses');
  console.log('- purchaseUtils.getStats() - Show current statistics');
  console.log('- purchaseUtils.resetPurchaseStatus() - Reset everything');
  console.log('- purchaseUtils.useGrowthSystem() - Use one attempt');
} 