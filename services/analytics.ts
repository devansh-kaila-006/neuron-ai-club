
/**
 * Mock Analytics Service
 * In production, this would bridge to Sentry, Google Analytics, or Mixpanel.
 */
export const analytics = {
  trackPageView(page: string) {
    console.debug(`[Analytics] Page View: ${page}`);
  },

  trackEvent(category: string, action: string, label?: string) {
    console.debug(`[Analytics] Event: [${category}] ${action}${label ? ` - ${label}` : ''}`);
  },

  trackError(error: Error | string, fatal = false) {
    console.error(`[Analytics] ${fatal ? 'FATAL ' : ''}Error:`, error);
  }
};
