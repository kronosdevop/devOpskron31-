// eventBus.js
const listeners = [];

export const notifyListeners = (newData) => {
    listeners.forEach((callback) => callback(newData));
};

export const addNotificationListener = (callback) => {
    listeners.push(callback);
};
