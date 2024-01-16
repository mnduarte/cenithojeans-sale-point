import React, { createContext, useContext, useReducer } from "react";
import Api from "../services/Api";
import { ERROR_MESSAGE_TIMEOUT } from "../utils/error";

// Definir las acciones disponibles para el usuario
const actionTypes = {
  LOADING: "loading",
  ERROR: "error",
  ADD_SUCCESS: "success",
  SET_HIDE_TOAST: "set_hide_toast",
};

const CashflowContext = createContext<any>(undefined);

type CashflowProviderProps = {
  children?: React.ReactNode;
};

// Proveedor de contexto para el contexto de precios
export const CashflowProvider: React.FC<CashflowProviderProps> = ({
  children,
}) => {
  const initialState: any = {
    loading: false,
    error: null,
    showSuccessToast: false,
    showErrorToast: false,
    showSuccessToastMsg: "",
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
      case actionTypes.ADD_SUCCESS: {
        return {
          ...state,
          loading: false,
          error: false,
          showSuccessToast: true,
          showSuccessToastMsg: action.payload,
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
    <CashflowContext.Provider value={{ state, dispatch }}>
      {children}
    </CashflowContext.Provider>
  );
};

// Hook personalizado para acceder al contexto de precios
export const useCashflow = () => {
  const context = useContext(CashflowContext);
  if (!context) {
    throw new Error("useCashflow debe usarse dentro de un CashflowProvider");
  }
  return context;
};

// Acciones para modificar el estado del contexto de precios
export const cashflowActions = {
  addCashflow:
    ({ type, amount, employee, description }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        await Api.addCashflow({
          type,
          amount,
          employee,
          description,
        });

        dispatch({
          type: actionTypes.ADD_SUCCESS,
          payload: `${type} añadido!!`,
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
};
