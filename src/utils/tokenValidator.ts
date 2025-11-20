import { storage } from './storage';

export const TokenValidator = {
  /**
   * Validasi token sebelum melakukan API call
   * Return true jika token masih valid ATAU untuk endpoint login
   */
  async validateToken(apiEndpoint?: string): Promise<boolean> {
    try {
      // ✅ PERBAIKAN: Selalu allow request login
      if (apiEndpoint?.includes('/auth/login')) {
        return true;
      }
      
      const token = await storage.getToken();
      const isExpired = await storage.isTokenExpired();
      
      if (!token || isExpired) {
        console.log('🚫 Token validation failed:', { 
          hasToken: !!token, 
          isExpired 
        });
        return false;
      }
      
      console.log('✅ Token validation passed');
      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  },

  /**
   * Cek token dan auto logout jika expired
   * Return true jika harus redirect ke login
   */
  async checkTokenAndRedirect(): Promise<boolean> {
    const isValid = await this.validateToken();
    
    if (!isValid) {
      console.log('🔀 Redirecting to login due to token expiry');
      await storage.removeToken();
      return true;
    }
    
    return false;
  }
};