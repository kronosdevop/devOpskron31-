import { get_current_user_web_portal } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import store from '@/store';
import { openDB } from 'idb';

/**
 * Utility class to handle authentication and user data management
 * Uses the existing get_current_user_web_portal query directly
 */
export class AuthHelper {
  /**
   * Clear chat data from IndexedDB
   */
  static async clearChatData() {
    try {
      const db = await openDB("STICHH_LOCALDATABASE", 7);
      const stores = ['STORE_CHAT_LIST', 'STORE_CHAT_MESSAGE'];
      
      for (const storeName of stores) {
        if (db.objectStoreNames.contains(storeName)) {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          await store.clear();
          await tx.done;
        }
      }
    } catch (error) {
      console.error('Error clearing chat data:', error);
    }
  }

  /**
   * Fetch user data using the existing query
   * @returns {Promise<Object>} User data object
   */
  static async fetchUserData() {
    try {
      // Clear previous user's chat data before fetching new user data
      await this.clearChatData();
      
      let result = await API.graphql(
        graphqlOperation(get_current_user_web_portal, {})
      );
      var response = JSON.parse(result.data.get_current_user_web_portal);

      if (response.Status == 'SUCCESS') {
        const userData = response.details;
        store.commit("SetUserObj", userData);
        return userData;
      } else {
        store.commit("SetUserObj", {});
        localStorage.removeItem("selectedNavItem");
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      
      // Handle authentication errors specifically
      if (error.name === 'NotAuthorizedException' || 
          error.message.includes('Access Token has been revoked') ||
          error.message.includes('Token is not valid')) {
        // Clear authentication data and throw a specific error
        await this.clearAuth();
        throw new Error('Authentication failed - please login again');
      }
      
      store.commit("SetUserObj", {});
      throw error;
    }
  }

  /**
   * Check if user is authenticated and has data
   * @returns {boolean}
   */
  static isAuthenticatedWithData() {
    const isAuthenticated = store.state.pAuth;
    const hasUserData = Object.keys(store.state.pCurrentUserObj).length > 0;
    return isAuthenticated && hasUserData;
  }

  /**
   * Get user data from store or fetch if not available
   * @returns {Promise<Object>} User data object
   */
  static async getUserData() {
    const existingData = store.state.pCurrentUserObj;
    
    if (Object.keys(existingData).length > 0) {
      return existingData;
    }
    
    return await this.fetchUserData();
  }

  /**
   * Clear authentication and user data
   */
  static async clearAuth() {
    try {
      // Clear chat data before clearing auth
      await this.clearChatData();
      
      // Clear store data
      store.commit('SetAuth', false);
      store.commit('SetUserEmail', '');
      store.commit('SetUserObj', {});
      
      // Clear localStorage items
      localStorage.removeItem('selectedNavItem');
      localStorage.removeItem('amplify-signin-with-hostedUI');
      localStorage.removeItem('amplify-cache');
      localStorage.removeItem('aws.cognito.identity-id');
      localStorage.removeItem('aws.cognito.identity-providers');
      
      // Clear any Amplify cached tokens
      const amplifyKeys = Object.keys(localStorage).filter(key => 
        key.includes('amplify') || key.includes('cognito') || key.includes('aws')
      );
      amplifyKeys.forEach(key => localStorage.removeItem(key));
      
      // Clear sessionStorage
      sessionStorage.clear();
      
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }
}

export default AuthHelper; 