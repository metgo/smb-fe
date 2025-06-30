class LocalStorageService {
  static set<T>(key: string, value: T): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  static get<T>(key: string): T | null {
    if (typeof window !== "undefined") {
      const item = localStorage.getItem(key);
      try {
        return item ? (JSON.parse(item) as T) : null;
      } catch (error) {
        console.error(`Failed to parse localStorage item "${key}":`, error);
        return null;
      }
    }
    return null;
  }

  static remove(key: string): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  }

  static clear(): void {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  }
}

export default LocalStorageService;
