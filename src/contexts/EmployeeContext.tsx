import React, { createContext, useContext, useReducer } from "react";
import { ERROR_MESSAGE_TIMEOUT } from "../utils/error";
import Api from "../services/Api";

// Definir las acciones disponibles para el usuario
const actionTypes = {
  LOADING: "loading",
  ERROR: "error",
  LIST_EMPLOYEES: "list_employees",
  SUCCESS_NEW_NUM_ORDER: "success_new_num_order",
  SET_HIDE_TOAST: "set_hide_toast",
};
// Tipo de estado para el contexto de empleados
type EmployeeState = {
  loading: boolean;
  error: any;
  employees: any[];
  showSuccessToast: boolean;
  showErrorToast: boolean;
  showSuccessToastMsg: any;
};
// Crear el contexto de precios
type EmployeeContextType = {
  state: EmployeeState; // Asegúrate de que PriceState esté definido según tu estructura
  dispatch: React.Dispatch<any>; // O ajusta el tipo según tu implementación
};

// Crear el contexto de precios
const EmployeeContext = createContext<EmployeeContextType | undefined>(
  undefined
);

type EmployeeProviderProps = {
  children?: React.ReactNode;
};

// Proveedor de contexto para el contexto de precios
export const EmployeeProvider: React.FC<EmployeeProviderProps> = ({
  children,
}) => {
  const initialState: EmployeeState = {
    loading: false,
    error: null,
    employees: [],
    showSuccessToast: false,
    showErrorToast: false,
    showSuccessToastMsg: "",
  };

  // Reducer para manejar acciones
  const reducer = (state: EmployeeState, action: any) => {
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
      case actionTypes.LIST_EMPLOYEES: {
        return {
          ...state,
          loading: false,
          employees: action.payload,
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
    <EmployeeContext.Provider value={{ state, dispatch }}>
      {children}
    </EmployeeContext.Provider>
  );
};

// Hook personalizado para acceder al contexto de empleados
export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error("useEmployee debe usarse dentro de un EmployeeProvider");
  }
  return context;
};

// Acciones para modificar el estado del contexto de precios
export const employeeActions = {
  getAll:
    ({ store }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.getEmployees({ store });

        dispatch({
          type: actionTypes.LIST_EMPLOYEES,
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
  addEmployee:
    ({ name, store, position, active, activeForCost, saleType }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.addEmployee({
          name,
          store,
          position,
          active,
          activeForCost,
          saleType,
        });

        dispatch({
          type: actionTypes.LIST_EMPLOYEES,
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
  updateEmployee:
    ({ id, name, store, position, active, activeForCost, saleType }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.updateEmployee({
          id,
          name,
          store,
          position,
          active,
          activeForCost,
          saleType,
        });

        dispatch({
          type: actionTypes.LIST_EMPLOYEES,
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
  addNewNumOrder:
    ({ employeeId, newNumOrder }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.addNewNumOrder({
          employeeId,
          newNumOrder,
        });

        dispatch({
          type: actionTypes.SUCCESS_NEW_NUM_ORDER,
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
  removeEmployee:
    ({ id }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.removeEmployee({ id });

        dispatch({
          type: actionTypes.LIST_EMPLOYEES,
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
