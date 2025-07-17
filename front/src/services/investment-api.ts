// Client-side service for fetching investment data from API
// This replaces direct database access from client components

export interface Investment {
  id: number;
  fecha: string;
  monto: number;
  concepto: string;
}

export interface InvestmentApiResponse {
  investments: Investment[];
  success: boolean;
}

export interface TotalApiResponse {
  total: number;
  success: boolean;
}

export const investmentApiService = {
  async getTotal(): Promise<number> {
    try {
      const response = await fetch('/api/investments/total');
      const data: TotalApiResponse = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to fetch total amount');
      }
      
      return data.total;
    } catch (error) {
      console.error('Error fetching total invested:', error);
      return 0;
    }
  },

  async getList(): Promise<Investment[]> {
    try {
      const response = await fetch('/api/investments/list');
      const data: InvestmentApiResponse = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to fetch investments list');
      }
      
      return data.investments;
    } catch (error) {
      console.error('Error fetching investments list:', error);
      return [];
    }
  }
};
