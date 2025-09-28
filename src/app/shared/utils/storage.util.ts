export function getStoredItem<T = string>(key: string): T | null {
    if (typeof window === 'undefined') return null; // SSR safe
    const stored = localStorage.getItem(key);
    if (stored === null) return null;

    try {
        return JSON.parse(stored) as T;
    } catch {
        return stored as unknown as T;
    }
}

export function setStoredItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    if (typeof value === 'string') {
        localStorage.setItem(key, value);
    } else {
        localStorage.setItem(key, JSON.stringify(value));
    }
}
