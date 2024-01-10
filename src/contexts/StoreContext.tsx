import React, { createContext, useContext, useReducer } from "react";
import { ERROR_MESSAGE_TIMEOUT } from "../utils/error";
import Api from "../services/Api";

// Definir las acciones disponibles para el usuario
const actionTypes = {
  LOADING: "loading",
  ERROR: "error",
  LIST_STORES: "list_stores",
};
// Tipo de estado para el contexto de empleados
type StoreState = {
  loading: boolean;
  error: any;
  stores: any[];
};
// Crear el contexto de precios
type StoreContextType = {
  state: StoreState; // Asegúrate de que PriceState esté definido según tu estructura
  dispatch: React.Dispatch<any>; // O ajusta el tipo según tu implementación
};

// Crear el contexto de precios
const StoreContext = createContext<StoreContextType | undefined>(
  undefined
);

type StoreProviderProps = {
  children?: React.ReactNode;
};

// Proveedor de contexto para el contexto de precios
export const StoreProvider: React.FC<StoreProviderProps> = ({
  children,
}) => {
  const initialState: StoreState = {
    loading: false,
    error: null,
    stores: [],
  };

  // Reducer para manejar acciones
  const reducer = (state: StoreState, action: any) => {
    switch (action.type) {
      case actionTypes.LOADING: {
        return {
          ...state,
          loading: true,
          error: null,
        };
      }
      case actionTypes.ERROR: {
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
      }
      case actionTypes.LIST_STORES: {
        return {
          ...state,
          loading: false,
          stores: action.payload,
        };
      }
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

// Hook personalizado para acceder al contexto de empleados
export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore debe usarse dentro de un StoreProvider");
  }
  return context;
};

// Acciones para modificar el estado del contexto de precios
export const storeActions = {
  getAll: () => async (dispatch: any) => {
    dispatch({
      type: actionTypes.LOADING,
      payload: { loading: true },
    });

    try {
      const { data } = await Api.getStores();

      dispatch({
        type: actionTypes.LIST_STORES,
        payload: data.results,
      });
    } catch (error) {
      console.log(error);

      dispatch({
        type: actionTypes.ERROR,
        payload: ERROR_MESSAGE_TIMEOUT,
      });
    }
  },
};
