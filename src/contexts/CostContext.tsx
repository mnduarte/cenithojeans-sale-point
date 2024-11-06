import React, { createContext, useContext, useReducer } from "react";
import Api from "../services/Api";
import { ERROR_MESSAGE_TIMEOUT } from "../utils/error";
import { formatDate } from "../utils/formatUtils";

// Definir las acciones disponibles para el usuario
const actionTypes = {
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
  ADD_COST: "add_cost",
  UPDATE_COST: "update_cost",
  LIST_COST: "list_cost",
};

// Tipo de estado para el contexto de precios
type CostState = {
  loading: boolean;
  error: any;
  costs: any;
};

// Crear el contexto de precios
type CostContextType = {
  state: CostState; // Asegúrate de que CostState esté definido según tu estructura
  dispatch: React.Dispatch<any>; // O ajusta el tipo según tu implementación
};

const CostContext = createContext<CostContextType | undefined>(undefined);

type CostProviderProps = {
  children?: React.ReactNode;
};

// Proveedor de contexto para el contexto de precios
export const CostProvider: React.FC<CostProviderProps> = ({ children }) => {
  const initialState: CostState = {
    loading: false,
    error: null,
    costs: [],
  };

  // Reducer para manejar acciones
  const reducer = (state: CostState, action: any) => {
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
          /*showSuccessToast: true,
          showSuccessToastMsg: action.payload,
          inboundSale: true,*/
        };
      }
      case actionTypes.ADD_COST: {
        return {
          ...state,
          loading: false,
          error: null,
          /*showSuccessToast: true,
          showSuccessToastMsg: "Pedido Actualizado",*/
          costs: [...state.costs, action.payload],
        };
      }
      case actionTypes.UPDATE_COST: {
        return {
          ...state,
          loading: false,
          error: null,
          /*showSuccessToast: true,
          showSuccessToastMsg: "Pedido Actualizado",*/
          costs: state.costs.map((cost: any) => {
            if (cost.id === action.payload.id) {
              return { ...cost, ...action.payload };
            }
            return cost;
          }),
        };
      }

      /*case actionTypes.SET_HIDE_TOAST: {
        return {
          ...state,
          showSuccessToast: false,
          showErrorToast: false,
          showSuccessToastMsg: "",
        };
      }*/
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <CostContext.Provider value={{ state, dispatch }}>
      {children}
    </CostContext.Provider>
  );
};

// Hook personalizado para acceder al contexto de precios
export const useCost = () => {
  const context = useContext(CostContext);
  if (!context) {
    throw new Error("useCost debe usarse dentro de un CostProvider");
  }
  return context;
};

// Acciones para modificar el estado del contexto de precios
export const costActions = {
  getCosts:
    ({
      startDate,
      endDate,
      typeSale,
      store,
      employee,
      typeShipment,
      checkoutDate,
    }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.getCosts({
          startDate,
          endDate,
          typeSale,
          store,
          employee,
          typeShipment,
          checkoutDate,
        });

        dispatch({
          type: actionTypes.LIST_COST,
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
  addCost:
    ({
      date,
      account,
      amount,
      approved,
      dateApproved,
      employee,
      customer,
      typeShipment,
      checkoutDate,
    }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.addCost({
          date,
          account,
          amount,
          approved,
          dateApproved,
          employee,
          customer,
          typeShipment,
          checkoutDate,
        });

        const formattedPayload = {
          ...data.results,
          date: formatDate(data.results.date),
          dateApproved: formatDate(data.results.dateApproved),
          checkoutDate: formatDate(data.results.checkoutDate),
        };

        dispatch({
          type: actionTypes.ADD_COST,
          payload: formattedPayload,
        });
      } catch (error) {
        console.log(error);

        dispatch({
          type: actionTypes.ERROR,
          payload: ERROR_MESSAGE_TIMEOUT,
        });
      }
    },
  updateCost:
    ({
      id,
      date,
      account,
      amount,
      approved,
      dateApproved,
      employee,
      customer,
      typeShipment,
      checkoutDate,
    }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.updateCost({
          id,
          date,
          account,
          amount,
          approved,
          dateApproved,
          employee,
          customer,
          typeShipment,
          checkoutDate,
        });

        dispatch({
          type: actionTypes.UPDATE_COST,
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

  /*setHideToasts: () => async (dispatch: any) => {
    dispatch({
      type: actionTypes.SET_HIDE_TOAST,
    });
  },*/
};
