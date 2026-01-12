// Utilidad para persistir la selección de cajero en localStorage

const CASHIER_STORAGE_KEY = "selectedCashier";

export interface StoredCashier {
  id: string;
  name: string;
  color: string;
  store: string;
}

export const getStoredCashier = (): StoredCashier | null => {
  try {
    const stored = localStorage.getItem(CASHIER_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch (error) {
    console.error("Error reading cashier from localStorage:", error);
    return null;
  }
};

export const setStoredCashier = (cashier: StoredCashier | null): void => {
  try {
    if (cashier) {
      localStorage.setItem(CASHIER_STORAGE_KEY, JSON.stringify(cashier));
    } else {
      localStorage.removeItem(CASHIER_STORAGE_KEY);
    }
  } catch (error) {
    console.error("Error saving cashier to localStorage:", error);
  }
};

export const clearStoredCashier = (): void => {
  try {
    localStorage.removeItem(CASHIER_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing cashier from localStorage:", error);
  }
};
