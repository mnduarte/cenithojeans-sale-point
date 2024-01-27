import React, { createContext, useContext, useReducer } from "react";
import Api from "../services/Api";
import { ERROR_MESSAGE_TIMEOUT } from "../utils/error";

// Definir las acciones disponibles para el usuario
const actionTypes = {
  LOADING: "loading",
  ERROR: "error",
  ADD_SUCCESS: "success",
  LIST_OBSERVATION: "list_observation",
  SET_HIDE_TOAST: "set_hide_toast",
};

const ObservationContext = createContext<any>(undefined);

type ObservationProviderProps = {
  children?: React.ReactNode;
};

// Proveedor de contexto para el contexto de precios
export const ObservationProvider: React.FC<ObservationProviderProps> = ({
  children,
}) => {
  const initialState: any = {
    loading: false,
    error: null,
    observations: [],
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
      case actionTypes.LIST_OBSERVATION: {
        return {
          ...state,
          loading: false,
          error: false,
          observations: action.payload,
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
    <ObservationContext.Provider value={{ state, dispatch }}>
      {children}
    </ObservationContext.Provider>
  );
};

// Hook personalizado para acceder al contexto de precios
export const useObservation = () => {
  const context = useContext(ObservationContext);
  if (!context) {
    throw new Error(
      "useObservation debe usarse dentro de un ObservationProvider"
    );
  }
  return context;
};

// Acciones para modificar el estado del contexto de precios
export const observationActions = {
  addObservation:
    ({ observation, store, username }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        await Api.addObservation({
          observation,
          store,
          username,
        });

        dispatch({
          type: actionTypes.ADD_SUCCESS,
          payload: `Observacion ingresada`,
        });
      } catch (error) {
        console.log(error);

        dispatch({
          type: actionTypes.ERROR,
          payload: ERROR_MESSAGE_TIMEOUT,
        });
      }
    },
  getObservations:
    ({ month, year, store }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.getObservations({
          month,
          year,
          store,
        });

        dispatch({
          type: actionTypes.LIST_OBSERVATION,
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
