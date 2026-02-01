import React, { createContext, useContext, useReducer } from "react";
import Api from "../services/Api";
import { ERROR_MESSAGE_TIMEOUT } from "../utils/error";

// Definir las acciones disponibles para el usuario
const actionTypes = {
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
  ADD_COST: "add_cost",
  UPDATE_COST: "update_cost",
  UPDATE_COLOR_COST: "update_color_cost",
  LIST_COST: "list_cost",
  REMOVE_COSTS: "remove_costs",
  LIST_ACCOUNTS: "list_accounts",
  ADD_ACCOUNT: "add_account",
  UPDATE_ACCOUNT: "update_account",
  REMOVE_ACCOUNTS: "remove_accounts",
};

// Tipo de estado para el contexto de precios
type CostState = {
  loading: boolean;
  error: any;
  costs: any;
  accounts: any;
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
    accounts: [],
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
      case actionTypes.LIST_COST: {
        return {
          ...state,
          loading: false,
          error: null,
          /*showSuccessToast: true,
          showSuccessToastMsg: "Pedido Actualizado",*/
          costs: action.payload,
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
      case actionTypes.UPDATE_COLOR_COST: {
        const { costsIds, backgroundColor, textColor, color } = action.payload;
        const idsToChangeColor = costsIds.map((cost: any) => cost.id);

        return {
          ...state,
          loading: false,
          error: null,
          costs: state.costs.map((cost: any) => {
            if (idsToChangeColor.includes(cost.id)) {
              return { ...cost, backgroundColor, textColor, color };
            }
            return cost;
          }),
        };
      }
      case actionTypes.REMOVE_COSTS: {
        const { costsIds } = action.payload;
        const idsToDelete = costsIds.map((cost: any) => cost.id);

        return {
          ...state,
          loading: false,
          error: null,
          costs: state.costs.filter(
            (cost: any) => !Boolean(idsToDelete.includes(cost.id))
          ),
        };
      }
      case actionTypes.LIST_ACCOUNTS: {
        return {
          ...state,
          loading: false,
          error: null,
          /*showSuccessToast: true,
          showSuccessToastMsg: "Pedido Actualizado",*/
          accounts: action.payload,
        };
      }
      case actionTypes.ADD_ACCOUNT: {
        return {
          ...state,
          loading: false,
          error: null,
          /*showSuccessToast: true,
          showSuccessToastMsg: "Pedido Actualizado",*/
          accounts: [...state.accounts, action.payload],
        };
      }
      case actionTypes.UPDATE_ACCOUNT: {
        return {
          ...state,
          loading: false,
          error: null,
          /*showSuccessToast: true,
          showSuccessToastMsg: "Pedido Actualizado",*/
          accounts: state.accounts.map((account: any) => {
            if (account.id === action.payload.id) {
              return { ...account, ...action.payload };
            }
            return account;
          }),
        };
      }
      case actionTypes.REMOVE_ACCOUNTS: {
        const { accountsIds } = action.payload;
        const idsToDelete = accountsIds.map((cost: any) => cost.id);

        return {
          ...state,
          loading: false,
          error: null,
          accounts: state.accounts.filter(
            (account: any) => !Boolean(idsToDelete.includes(account.id))
          ),
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

export const costActions = {
  getCosts:
    ({
      startDate,
      endDate,
      accounts,
      employees,
      typeShipment,
      checkoutDate,
      approved,
      store,
      q,
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
          accounts: accounts.join(","),
          employees: employees.join(","),
          typeShipment,
          checkoutDate,
          approved,
          store,
          q,
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
  getCostsByDateApproved:
    ({ dateApproved, store }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.getCostsByDateApproved({
          dateApproved,
          store,
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
      numOrder,
      amount,
      approved,
      dateApproved,
      employee,
      customer,
      typeShipment,
      checkoutDate,
      cashierId,
      cashierName,
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
          numOrder,
          amount,
          approved,
          dateApproved,
          employee,
          customer,
          typeShipment,
          checkoutDate,
          cashierId,
          cashierName,
        });

        const formattedPayload = {
          ...data.results,
          date,
          dateApproved,
        };

        if (data.results.checkoutDate) {
          const [year, month, day] = data.results.checkoutDate
            .split("T")[0]
            .split("-");
          formattedPayload.checkoutDate = `${day}/${month}/${year}`;
        }

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
      numOrder,
      amount,
      approved,
      dateApproved,
      employee,
      customer,
      typeShipment,
      checkoutDate,
      lastEditCashierId,
      lastEditCashierName,
      checkoutCashierId,
      checkoutCashierName,
      editedField,
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
          numOrder,
          amount,
          approved,
          dateApproved,
          employee,
          customer,
          typeShipment,
          checkoutDate,
          lastEditCashierId,
          lastEditCashierName,
          checkoutCashierId,
          checkoutCashierName,
          editedField,
        });

        const formattedPayload = {
          ...data.results,
          date,
          dateApproved,
        };

        if (data.results.checkoutDate) {
          const [year, month, day] = data.results.checkoutDate
            .split("T")[0]
            .split("-");
          formattedPayload.checkoutDate = `${day}/${month}/${year}`;
        }

        dispatch({
          type: actionTypes.UPDATE_COST,
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
  updateColorCost:
    ({ costsIds, backgroundColor, textColor, color }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        await Api.updateColorCost({
          costsIds,
          backgroundColor,
          textColor,
          color,
        });

        dispatch({
          type: actionTypes.UPDATE_COLOR_COST,
          payload: { costsIds, backgroundColor, textColor, color },
        });
      } catch (error) {
        console.log(error);

        dispatch({
          type: actionTypes.ERROR,
          payload: ERROR_MESSAGE_TIMEOUT,
        });
      }
    },

  removeCosts:
    ({ costsIds }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        await Api.removeCosts({
          costsIds,
        });

        dispatch({
          type: actionTypes.REMOVE_COSTS,
          payload: { costsIds },
        });
      } catch (error) {
        console.log(error);

        dispatch({
          type: actionTypes.ERROR,
          payload: ERROR_MESSAGE_TIMEOUT,
        });
      }
    },

  getAccounts:
    ({}: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.getAccounts({});

        dispatch({
          type: actionTypes.LIST_ACCOUNTS,
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
  addAccount:
    ({ name }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.addAccount({
          name,
        });

        dispatch({
          type: actionTypes.ADD_ACCOUNT,
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
  updateAccount:
    ({ id, name }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.updateAccount({
          id,
          name,
        });

        dispatch({
          type: actionTypes.UPDATE_ACCOUNT,
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
  removeAccounts:
    ({ accountsIds }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        await Api.removeAccounts({
          accountsIds,
        });

        dispatch({
          type: actionTypes.REMOVE_ACCOUNTS,
          payload: { accountsIds },
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
