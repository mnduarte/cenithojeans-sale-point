import React, { createContext, useContext, useReducer } from "react";
import Api from "../services/Api";
import { ERROR_MESSAGE_TIMEOUT } from "../utils/error";

// Definir las acciones disponibles para el usuario
const actionTypes = {
  LOADING: "loading",
  ERROR: "error",
  LIST_DATA: "list_data",
  LIST_ITEMS: "list_items",
  LIST_ITEMS_BY_EMPLOYEE: "list_items_by_employee",
  LIST_SALES_CASH: "list_sales_cash",
  LIST_SALES_TRANSFER: "list_sales_transfer",
  LIST_SALES_CASH_BY_EMPLOYEE: "list_sales_cash_by_employee",
  LIST_SALES_TRANSFER_BY_EMPLOYEE: "list_sales_cash_by_employee",
};

const GraphContext = createContext<any>(undefined);

type GraphProviderProps = {
  children?: React.ReactNode;
};

// Proveedor de contexto para el contexto de precios
export const GraphProvider: React.FC<GraphProviderProps> = ({ children }) => {
  const initialState: any = {
    loading: false,
    error: null,
    data: {},
  };

  // Reducer para manejar acciones
  const reducer = (state: any, action: any) => {
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
          showErrorToast: true,
          showSuccessToastMsg: "¡Error! Algo salió mal.",
        };
      }
      case actionTypes.LIST_DATA: {
        return {
          ...state,
          loading: false,
          error: false,
          data: action.payload,
        };
      }
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <GraphContext.Provider value={{ state, dispatch }}>
      {children}
    </GraphContext.Provider>
  );
};

// Hook personalizado para acceder al contexto de precios
export const useGraph = () => {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error("useGraph debe usarse dentro de un GraphProvider");
  }
  return context;
};

// Acciones para modificar el estado del contexto de precios
export const graphActions = {
  getData:
    ({ startDate, endDate, store }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.getGraphData({
          startDate,
          endDate,
          store,
        });

        dispatch({
          type: actionTypes.LIST_DATA,
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
