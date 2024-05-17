import React, { createContext, useContext, useReducer } from "react";
import Api from "../services/Api";
import { ERROR_MESSAGE_TIMEOUT } from "../utils/error";

// Definir las acciones disponibles para el usuario
const actionTypes = {
  LOADING: "loading",
  ERROR: "error",
  DELETE_DATA: "delete_data",
  SET_HIDE_TOAST: "set_hide_toast",
};

const AdminContext = createContext<any>(undefined);

type AdminProviderProps = {
  children?: React.ReactNode;
};

// Proveedor de contexto para el contexto de precios
export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
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
          successDeleted: false,
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
      case actionTypes.DELETE_DATA: {;
        return {
          ...state,
          loading: false,
          error: false,
          showSuccessToast: true,
          showSuccessToastMsg: action.payload.message,
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
    <AdminContext.Provider value={{ state, dispatch }}>
      {children}
    </AdminContext.Provider>
  );
};

// Hook personalizado para acceder al contexto de precios
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin debe usarse dentro de un AdminProvider");
  }
  return context;
};

// Acciones para modificar el estado del contexto de precios
export const adminActions = {
  deleteData:
    ({ startDate, endDate }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.deleteData({
          startDate,
          endDate,
        });

        dispatch({
          type: actionTypes.DELETE_DATA,
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
};
