import { browser } from '$app/environment';

export const authClient = {
  async redirectToAuth() {
    if (!browser) return;
    
    const response = await fetch('/api/auth/oauth-url');
    const { url } = await response.json();
    
    if (url) {
      window.location.href = url;
    }
  }
};