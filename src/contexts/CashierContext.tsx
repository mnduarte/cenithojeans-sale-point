import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import Api from "../services/Api";
import {
  getStoredCashier,
  setStoredCashier,
  StoredCashier,
} from "../utils/cashierStorage";

// Types
interface CashierState {
  cashiers: any;
  selectedCashier: StoredCashier | null;
  loading: boolean;
  error: string | null;
}

type CashierAction =
  | { type: "SET_CASHIERS"; payload: any }
  | { type: "SET_SELECTED_CASHIER"; payload: StoredCashier | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

interface CashierContextType extends CashierState {
  fetchCashiers: (store?: string) => Promise<void>;
  fetchAllCashiers: () => Promise<void>;
  selectCashier: (cashier: StoredCashier | null) => void;
  addCashier: (cashier: {
    name: string;
    store: string;
    color: string;
    position: number;
  }) => Promise<void>;
  editCashier: (cashier: {
    id: string;
    name: string;
    store: string;
    color: string;
    position: number;
    active?: boolean;
  }) => Promise<void>;
  removeCashier: (id: string) => Promise<void>;
  getCashierById: (id: string) => any | undefined;
  getCashiersForStore: (store: string) => any;
  getCashiersForRole: (store: string, isAdmin: boolean) => any[];
}

// Initial state
const initialState: CashierState = {
  cashiers: [],
  selectedCashier: null,
  loading: false,
  error: null,
};

// Reducer
const cashierReducer = (
  state: CashierState,
  action: CashierAction
): CashierState => {
  switch (action.type) {
    case "SET_CASHIERS":
      return { ...state, cashiers: action.payload };
    case "SET_SELECTED_CASHIER":
      return { ...state, selectedCashier: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

// Context
const CashierContext = createContext<CashierContextType | undefined>(undefined);

// Provider
interface CashierProviderProps {
  children: ReactNode;
}

export const CashierProvider: React.FC<CashierProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(cashierReducer, initialState);

  // Cargar cajero seleccionado desde localStorage al inicio
  useEffect(() => {
    const stored = getStoredCashier();
    if (stored) {
      dispatch({ type: "SET_SELECTED_CASHIER", payload: stored });
    }
  }, []);

  // Obtener cajeros por sucursal
  const fetchCashiers = useCallback(async (store?: string) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });
    try {
      const cashiers = store
        ? await Api.getCashiersByStore(store)
        : await Api.getAllCashiers();
      dispatch({ type: "SET_CASHIERS", payload: cashiers });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error al cargar cajeros" });
      console.error("Error fetching cashiers:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Obtener todos los cajeros
  const fetchAllCashiers = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });
    try {
      const cashiers = await Api.getAllCashiers();
      dispatch({ type: "SET_CASHIERS", payload: cashiers });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error al cargar cajeros" });
      console.error("Error fetching all cashiers:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Seleccionar cajero y persistir
  const selectCashier = useCallback((cashier: StoredCashier | null) => {
    dispatch({ type: "SET_SELECTED_CASHIER", payload: cashier });
    setStoredCashier(cashier);
  }, []);

  // Agregar cajero
  const addCashier = useCallback(
    async (cashier: {
      name: string;
      store: string;
      color: string;
      position: number;
    }) => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const updatedCashiers = await Api.createCashier(cashier);
        dispatch({ type: "SET_CASHIERS", payload: updatedCashiers });
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Error al crear cajero" });
        throw error;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    []
  );

  // Editar cajero
  const editCashier = useCallback(
    async (cashier: {
      id: string;
      name: string;
      store: string;
      color: string;
      position: number;
      active?: boolean;
    }) => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const updatedCashiers = await Api.updateCashier(cashier);
        dispatch({ type: "SET_CASHIERS", payload: updatedCashiers });

        // Si el cajero editado es el seleccionado, actualizar
        if (state.selectedCashier?.id === cashier.id) {
          const updatedSelected: StoredCashier = {
            id: cashier.id,
            name: cashier.name,
            color: cashier.color,
            store: cashier.store,
          };
          selectCashier(updatedSelected);
        }
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Error al editar cajero" });
        throw error;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [state.selectedCashier, selectCashier]
  );

  // Eliminar cajero
  const removeCashier = useCallback(
    async (id: string) => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const updatedCashiers = await Api.deleteCashier(id);
        dispatch({ type: "SET_CASHIERS", payload: updatedCashiers });

        // Si el cajero eliminado es el seleccionado, limpiar selección
        if (state.selectedCashier?.id === id) {
          selectCashier(null);
        }
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Error al eliminar cajero" });
        throw error;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [state.selectedCashier, selectCashier]
  );

  // Obtener cajero por ID
  const getCashierById = useCallback(
    (id: string) => {
      return state.cashiers.find((c: any) => c.id === id);
    },
    [state.cashiers]
  );

  // Obtener cajeros filtrados por sucursal
  const getCashiersForStore = useCallback(
    (store: string) => {
      if (store === "ALL") return state.cashiers;
      return state.cashiers.filter((c: any) => c.store === store && !c.isAdmin);
    },
    [state.cashiers]
  );

  const getCashiersForRole = useCallback(
    (store: string, isAdmin: boolean) => {
      let filtered = state.cashiers;

      // Filtrar por store
      if (store !== "ALL") {
        filtered = filtered.filter((c: any) => c.store === store);
      }

      // Si NO es admin, excluir cajeros marcados como isAdmin
      if (!isAdmin) {
        filtered = filtered.filter((c: any) => !c.isAdmin);
      }

      return filtered;
    },
    [state.cashiers]
  );

  const value: CashierContextType = {
    ...state,
    fetchCashiers,
    fetchAllCashiers,
    selectCashier,
    addCashier,
    editCashier,
    removeCashier,
    getCashierById,
    getCashiersForStore,
    getCashiersForRole,
  };

  return (
    <CashierContext.Provider value={value}>{children}</CashierContext.Provider>
  );
};

// Hook
export const useCashier = (): CashierContextType => {
  const context = useContext(CashierContext);
  if (!context) {
    throw new Error("useCashier must be used within a CashierProvider");
  }
  return context;
};

export default CashierContext;
