/**
 * clientStorage File which are helper functions for managing localStorage
 * 
 */

function getFromStorage<T>(key: string, def?: T): Promise<T> {
    try {
        const userStr = window.localStorage.getItem(key);
        if (userStr) {
            const userObj = JSON.parse(userStr);
            return Promise.resolve(userObj as T);
        } else {
            return Promise.resolve(def);
        }
    } catch(e) {
        console.log(e);
        return Promise.resolve(def);
    }
}

function saveToStorage<T>(key: string, obj: T): Promise<void> {
    if(obj == null) {
        window.localStorage.removeItem(key);
    } else {
        window.localStorage.setItem(key, JSON.stringify(obj));
    }

    return Promise.resolve();
}

function removeFromStorage<T>(keys: string | string[], def?: T): Promise<void> {
    if (keys) {
        try {
            if (Array.isArray(keys) && keys.length) {
                keys.forEach(key => { window.localStorage.removeItem(key) });
            } else {
                window.localStorage.removeItem(keys as string)
            }
            return Promise.resolve();
        } catch (e) {
            console.log("Failed to Remove Key from localStorage: ", e);
            Promise.resolve(def);
        }
    }
}

export default {
  getFromStorage,
  saveToStorage,
  removeFromStorage
}
