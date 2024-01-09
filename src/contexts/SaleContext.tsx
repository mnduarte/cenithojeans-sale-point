import React, { createContext, useContext, useReducer } from "react";
import Api from "../services/Api";
import { ERROR_MESSAGE_TIMEOUT } from "../utils/error";

// Definir las acciones disponibles para el usuario
const actionTypes = {
  LOADING: "loading",
  ERROR: "error",
  LIST_SALES: "list_sales",
  ADD_SALE: "add_sale",
  SUCCESS: "success",
  SET_HIDE_TOAST: "set_hide_toast",
  NEW_SALE: "new_sale",
};

// Tipo de estado para el contexto de precios
type SaleState = {
  loading: boolean;
  error: any;
  sales: any[];
  showSuccessToast: boolean;
  showErrorToast: boolean;
  showSuccessToastMsg: any;
  inboundSale: boolean;
};

// Crear el contexto de precios
type SaleContextType = {
  state: SaleState; // Asegúrate de que SaleState esté definido según tu estructura
  dispatch: React.Dispatch<any>; // O ajusta el tipo según tu implementación
};

const SaleContext = createContext<SaleContextType | undefined>(undefined);

type SaleProviderProps = {
  children?: React.ReactNode;
};

// Proveedor de contexto para el contexto de precios
export const SaleProvider: React.FC<SaleProviderProps> = ({ children }) => {
  const initialState: SaleState = {
    loading: false,
    error: null,
    sales: [],
    showSuccessToast: false,
    showErrorToast: false,
    showSuccessToastMsg: "",
    inboundSale: false,
  };

  // Reducer para manejar acciones
  const reducer = (state: SaleState, action: any) => {
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
      case actionTypes.SUCCESS: {
        return {
          ...state,
          loading: false,
          error: null,
          showSuccessToast: true,
          showSuccessToastMsg: action.payload,
          inboundSale: true,
        };
      }
      case actionTypes.NEW_SALE: {
        return {
          ...state,
          inboundSale: false,
        };
      }
      case actionTypes.LIST_SALES: {
        return {
          ...state,
          loading: false,
          sales: action.payload,
        };
      }
      case actionTypes.SET_HIDE_TOAST: {
        return {
          ...state,
          showSuccessToast: false,
          showErrorToast: false,
          showSuccessToastMsg: "",
        };
      }
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <SaleContext.Provider value={{ state, dispatch }}>
      {children}
    </SaleContext.Provider>
  );
};

// Hook personalizado para acceder al contexto de precios
export const useSale = () => {
  const context = useContext(SaleContext);
  if (!context) {
    throw new Error("useSale debe usarse dentro de un SaleProvider");
  }
  return context;
};

// Acciones para modificar el estado del contexto de precios
export const saleActions = {
  getSales:
    ({ startDate, endDate, store, employee }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.getSales({
          startDate,
          endDate,
          store,
          employee,
        });

        dispatch({
          type: actionTypes.LIST_SALES,
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
  addSale:
    ({
      store,
      employee,
      typeSale,
      typePayment,
      items,
      subTotalItems,
      devolutionItems,
      subTotalDevolutionItems,
      percentageToDisccountOrAdd,
      username,
      total,
    }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.addSale({
          store,
          employee,
          typeSale,
          typePayment,
          items,
          subTotalItems,
          devolutionItems,
          subTotalDevolutionItems,
          percentageToDisccountOrAdd,
          username,
          total,
        });

        dispatch({
          type: actionTypes.SUCCESS,
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
  printSale:
    ({
      pricesSelected,
      devolutionPricesSelected,
      percentageToDisccountOrAdd,
      username,
      seller,
      totalPrice,
    }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.printSale({
          pricesSelected,
          devolutionPricesSelected,
          percentageToDisccountOrAdd,
          username,
          seller,
          totalPrice,
        });

        dispatch({
          type: actionTypes.SUCCESS,
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
  setHideToasts: () => async (dispatch: any) => {
    dispatch({
      type: actionTypes.SET_HIDE_TOAST,
    });
  },
  newSale: () => async (dispatch: any) => {
    dispatch({
      type: actionTypes.NEW_SALE,
    });
  },
};
