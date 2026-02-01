import React, { createContext, useContext, useReducer } from "react";
import Api from "../services/Api";
import { ERROR_MESSAGE_TIMEOUT } from "../utils/error";

// Definir las acciones disponibles para el usuario
const actionTypes = {
  LOADING: "loading",
  ERROR: "error",
  LIST_PRICES: "list_prices",
  ADD_PRICE: "add_price",
  UPDATE_PRICE: "update_price",
  REMOVE_PRICE: "remove_price",
  SET_ORDER: "set_order",
};

// Tipo de estado para el contexto de precios
type PriceState = {
  loading: boolean;
  error: any;
  order: string;
  prices: any[];
};

// Crear el contexto de precios
type PriceContextType = {
  state: PriceState; // Asegúrate de que PriceState esté definido según tu estructura
  dispatch: React.Dispatch<any>; // O ajusta el tipo según tu implementación
};

const PriceContext = createContext<PriceContextType | undefined>(undefined);

type PriceProviderProps = {
  children?: React.ReactNode;
};

// Proveedor de contexto para el contexto de precios
export const PriceProvider: React.FC<PriceProviderProps> = ({ children }) => {
  const initialState: PriceState = {
    loading: false,
    error: null,
    order: "",
    prices: [],
  };

  // Reducer para manejar acciones
  const reducer = (state: PriceState, action: any) => {
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
      case actionTypes.LIST_PRICES: {
        return {
          ...state,
          loading: false,
          prices: action.payload,
        };
      }
      case actionTypes.SET_ORDER: {
        return {
          ...state,
          order: action.payload,
          prices: state.prices.sort((a: any, b: any) =>
            action.payload === "lower" ? a.price - b.price : b.price - a.price
          ),
        };
      }
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <PriceContext.Provider value={{ state, dispatch }}>
      {children}
    </PriceContext.Provider>
  );
};

// Hook personalizado para acceder al contexto de precios
export const usePrice = () => {
  const context = useContext(PriceContext);
  if (!context) {
    throw new Error("usePrice debe usarse dentro de un PriceProvider");
  }
  return context;
};

// Acciones para modificar el estado del contexto de precios
export const priceActions = {
  getAll: () => async (dispatch: any) => {
    dispatch({
      type: actionTypes.LOADING,
      payload: { loading: true },
    });

    try {
      const { data } = await Api.getPrices();

      dispatch({
        type: actionTypes.LIST_PRICES,
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
  addPrice:
    ({ price, active, type }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.addPrice({ price, active, type });

        dispatch({
          type: actionTypes.LIST_PRICES,
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
  updatePrice:
    ({ id, price, active, type }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.updatePrice({ id, price, active, type });

        dispatch({
          type: actionTypes.LIST_PRICES,
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
  deleteSelectedPrices:
    ({ itemsIdSelected, deleteAll, type }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.deleteSelectedPrices({
          itemsIdSelected,
          deleteAll,
          type,
        });

        dispatch({
          type: actionTypes.LIST_PRICES,
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
  removePrice:
    ({ id }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.removePrice({ id });

        dispatch({
          type: actionTypes.LIST_PRICES,
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
  setOrderPrices: (value: any) => async (dispatch: any) => {
    dispatch({
      type: actionTypes.SET_ORDER,
      payload: value,
    });
  },
};
