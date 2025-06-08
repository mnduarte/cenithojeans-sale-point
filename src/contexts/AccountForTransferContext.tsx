import React, { createContext, useContext, useReducer } from "react";
import { ERROR_MESSAGE_TIMEOUT } from "../utils/error";
import Api from "../services/Api";

// Definir las acciones disponibles para el usuario
const actionTypes = {
  LOADING: "loading",
  ERROR: "error",
  LIST_ACCOUNTS_FOR_TRANSFER: "list_accounts_for_transfer",
  SUCCESS_NEW_NUM_ORDER: "success_new_num_order",
  SET_HIDE_TOAST: "set_hide_toast",
};
// Tipo de estado para el contexto de empleados
type AccountForTransferState = {
  loading: boolean;
  error: any;
  accountsForTransfer: any[];
  showSuccessToast: boolean;
  showErrorToast: boolean;
  showSuccessToastMsg: any;
};
// Crear el contexto de precios
type AccountForTransferContextType = {
  state: AccountForTransferState; // Asegúrate de que PriceState esté definido según tu estructura
  dispatch: React.Dispatch<any>; // O ajusta el tipo según tu implementación
};

// Crear el contexto de precios
const AccountForTransferContext = createContext<
  AccountForTransferContextType | undefined
>(undefined);

type AccountForTransferProviderProps = {
  children?: React.ReactNode;
};

// Proveedor de contexto para el contexto de precios
export const AccountForTransferProvider: React.FC<
  AccountForTransferProviderProps
> = ({ children }) => {
  const initialState: AccountForTransferState = {
    loading: false,
    error: null,
    accountsForTransfer: [],
    showSuccessToast: false,
    showErrorToast: false,
    showSuccessToastMsg: "",
  };

  // Reducer para manejar acciones
  const reducer = (state: AccountForTransferState, action: any) => {
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
      case actionTypes.LIST_ACCOUNTS_FOR_TRANSFER: {
        return {
          ...state,
          loading: false,
          accountsForTransfer: action.payload.sort(
            (a: any, b: any) => a.position - b.position
          ),
        };
      }
      case actionTypes.SUCCESS_NEW_NUM_ORDER: {
        return {
          ...state,
          error: null,
          loading: false,
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
    <AccountForTransferContext.Provider value={{ state, dispatch }}>
      {children}
    </AccountForTransferContext.Provider>
  );
};

// Hook personalizado para acceder al contexto de empleados
export const useAccountForTransfer = () => {
  const context = useContext(AccountForTransferContext);
  if (!context) {
    throw new Error(
      "useAccountForTransfer debe usarse dentro de un AccountForTranferProvider"
    );
  }
  return context;
};

// Acciones para modificar el estado del contexto de precios
export const accountForTransferActions = {
  getAll:
    ({ store }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.getAccountsForTransfer({ store });

        dispatch({
          type: actionTypes.LIST_ACCOUNTS_FOR_TRANSFER,
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
  addAccountForTransfer:
    ({ name, store, position, active }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.addAccountForTransfer({
          name,
          store,
          position,
          active,
        });

        dispatch({
          type: actionTypes.LIST_ACCOUNTS_FOR_TRANSFER,
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
  updateAccountForTransfer:
    ({ id, name, store, position, active, activeForCost }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.updateAccountForTransfer({
          id,
          name,
          store,
          position,
          active,
        });

        dispatch({
          type: actionTypes.LIST_ACCOUNTS_FOR_TRANSFER,
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
  removeAccountForTransfer:
    ({ id }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.removeAccountForTransfer({ id });

        dispatch({
          type: actionTypes.LIST_ACCOUNTS_FOR_TRANSFER,
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
