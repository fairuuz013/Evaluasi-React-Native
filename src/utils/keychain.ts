import * as Keychain from 'react-native-keychain';

const SERVICE_NAME = 'com.ecom.userToken';

export const KeychainService = {
  async saveToken(token: string): Promise<boolean> {
    try {
      await Keychain.setGenericPassword('userToken', token, {
        service: SERVICE_NAME,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        securityLevel: Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
      });
      console.log('✅ Token saved to Keychain');
      return true;
    } catch (error) {
      console.error('❌ Error saving token to keychain:', error);
      return false;
    }
  },

  async getToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: SERVICE_NAME,
      });
      
      if (credentials && credentials.password) {
        console.log('✅ Token retrieved from Keychain');
        return credentials.password;
      }
      
      console.log('ℹ️ No token found in Keychain');
      return null;
    } catch (error) {
      console.error('❌ Error getting token from keychain:', error);
      return null;
    }
  },

  async deleteToken(): Promise<boolean> {
    try {
      await Keychain.resetGenericPassword({ service: SERVICE_NAME });
      console.log('✅ Token deleted from Keychain');
      return true;
    } catch (error) {
      console.error('❌ Error deleting token from keychain:', error);
      return false;
    }
  },
};