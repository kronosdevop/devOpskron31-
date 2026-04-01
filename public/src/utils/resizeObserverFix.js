// Fix for ResizeObserver loop completed with undelivered notifications
// This is a common warning with Vuetify components that doesn't affect functionality

export const suppressResizeObserverWarnings = () => {
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const _ResizeObserver = window.ResizeObserver;
  window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
    constructor(callback) {
      callback = debounce(callback, 16);
      super(callback);
    }
  };
};

export default suppressResizeObserverWarnings;
