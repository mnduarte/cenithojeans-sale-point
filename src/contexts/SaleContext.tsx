import React, { createContext, useContext, useReducer } from "react";
import Api from "../services/Api";
import { ERROR_MESSAGE_TIMEOUT } from "../utils/error";

// Definir las acciones disponibles para el usuario
const actionTypes = {
  LOADING: "loading",
  ERROR: "error",
  LIST_SALES: "list_sales",
  LIST_ORDERS: "list_orders",
  LIST_REPORTS: "list_reports",
  LIST_SALES_BY_EMPLOYEES: "list_sales_by_employees",
  LIST_SALES_TRANSFER_BY_EMPLOYEES: "list_sales_transfer_by_employees",
  LIST_SALE_BY_EMPLOYEES: "list_sale_by_employees",
  ADD_SALE: "add_sale",
  ADD_NEW_ROW_SALE: "add_new_row_sale",
  REMOVE_EMPTY_ROW: "remove_empty_row",
  REMOVE_SALES: "remove_sales",
  SUCCESS: "success",
  SUCCESS_PRINT: "success_print",
  SET_HIDE_TOAST: "set_hide_toast",
  NEW_SALE: "new_sale",
  UPDATE_SALE: "update_sale",
  UPDATE_ORDER: "update_order",
  UPDATE_SALE_BY_EMPLOYEE: "update_sale_by_employee",
  CANCEL_ORDERS: "cancel_orders",
  LAST_NUM_ORDER_BY_SELLER: "last_num_order_by_seller",
};

// Tipo de estado para el contexto de precios
type SaleState = {
  loading: boolean;
  error: any;
  reports: any;
  orders: any[];
  sales: any[];
  lastSaleUpdated: any;
  salesByEmployees: any[];
  salesTransferByEmployees: any[];
  showSuccessToast: boolean;
  showErrorToast: boolean;
  showSuccessToastMsg: any;
  inboundSale: boolean;
  lastNumOrder: any;
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
    reports: {
      salesGeneral: [],
      typeSale: null,
    },
    orders: [],
    sales: [],
    lastSaleUpdated: null,
    salesByEmployees: [],
    salesTransferByEmployees: [],
    showSuccessToast: false,
    showErrorToast: false,
    showSuccessToastMsg: "",
    inboundSale: false,
    lastNumOrder: null,
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
      case actionTypes.UPDATE_SALE: {
        return {
          ...state,
          loading: false,
          error: null,
          showSuccessToast: true,
          showSuccessToastMsg: "Pedido Actualizado",
          sales: state.sales.map((sale: any) => {
            if (sale.id === action.payload.id) {
              return { ...sale, ...action.payload };
            }
            return sale;
          }),
        };
      }
      case actionTypes.UPDATE_ORDER: {
        return {
          ...state,
          loading: false,
          error: null,
          showSuccessToast: true,
          showSuccessToastMsg: "Pedido Actualizado",
          orders: state.orders.map((order: any) => {
            if (order.id === action.payload.id) {
              return { ...order, ...action.payload };
            }
            return order;
          }),
        };
      }
      case actionTypes.UPDATE_SALE_BY_EMPLOYEE: {
        const newSalesByEmployees = state.salesByEmployees;
        const newSalesTransferByEmployees = state.salesTransferByEmployees;

        if (newSalesByEmployees[action.payload.employee]) {
          newSalesByEmployees[action.payload.employee] = newSalesByEmployees[
            action.payload.employee
          ].map((sale: any) => {
            if (sale.id === action.payload.id) {
              return { ...sale, ...action.payload };
            }
            return sale;
          });
        }

        return {
          ...state,
          loading: false,
          error: null,
          showSuccessToast: true,
          showSuccessToastMsg: "Venta actualizada",
          salesByEmployees: newSalesByEmployees,
          salesTransferByEmployees: newSalesTransferByEmployees.map(
            (sale: any) => {
              if (sale.id === action.payload.id) {
                return { ...sale, ...action.payload };
              }
              return sale;
            }
          ),
          lastSaleUpdated: action.payload,
        };
      }
      case actionTypes.CANCEL_ORDERS: {
        return {
          ...state,
          loading: false,
          error: null,
          showSuccessToast: true,
          showSuccessToastMsg: "Pedidos anulados",
          orders: state.orders.map((order: any) => {
            const foundItem = action.payload.find(
              (orderUpdated: any) => orderUpdated.id === order.id
            );

            if (foundItem) {
              return { ...order, ...foundItem };
            }
            return order;
          }),
        };
      }
      case actionTypes.ADD_NEW_ROW_SALE: {
        const newSalesByEmployees = state.salesByEmployees;

        const lastSale =
          newSalesByEmployees[action.payload][
            newSalesByEmployees[action.payload].length - 1
          ];

        if (lastSale.id) {
          newSalesByEmployees[action.payload] = [
            ...newSalesByEmployees[action.payload],
            { items: "", total: "" },
          ];
        }

        return {
          ...state,
          salesByEmployees: newSalesByEmployees,
        };
      }
      case actionTypes.REMOVE_SALES: {
        const { salesIds, cashflowIds } = action.payload;
        const newSalesTransferByEmployees = state.salesTransferByEmployees;
        const formatIdSalesRemoved = [...salesIds, ...cashflowIds].map(
          ({ id }: any) => id
        );
        const newSalesByEmployees: any = {};

        Object.entries(state.salesByEmployees).forEach(
          (saleByEmployee: any) => {
            const [emp, sales] = saleByEmployee;

            newSalesByEmployees[emp] = sales.filter(
              (sale: any) => !formatIdSalesRemoved.includes(sale.id)
            );
          }
        );

        return {
          ...state,
          loading: false,
          error: null,
          salesByEmployees: newSalesByEmployees,
          salesTransferByEmployees: newSalesTransferByEmployees.filter(
            (sale: any) => !formatIdSalesRemoved.includes(sale.id)
          ),
        };
      }
      case actionTypes.SUCCESS_PRINT: {
        return {
          ...state,
          loading: false,
          error: null,
          showSuccessToast: true,
          showSuccessToastMsg: action.payload,
        };
      }
      case actionTypes.NEW_SALE: {
        return {
          ...state,
          inboundSale: false,
          lastNumOrder: null,
        };
      }
      case actionTypes.LAST_NUM_ORDER_BY_SELLER: {
        return {
          ...state,
          loading: false,
          error: null,
          lastNumOrder: action.payload,
        };
      }
      case actionTypes.LIST_SALES: {
        return {
          ...state,
          loading: false,
          sales: action.payload,
        };
      }
      case actionTypes.LIST_ORDERS: {
        return {
          ...state,
          loading: false,
          orders: action.payload,
        };
      }
      case actionTypes.LIST_REPORTS: {
        return {
          ...state,
          loading: false,
          reports: { ...action.payload },
        };
      }
      case actionTypes.LIST_SALES_BY_EMPLOYEES: {
        return {
          ...state,
          loading: false,
          salesByEmployees: action.payload,
        };
      }
      case actionTypes.LIST_SALES_TRANSFER_BY_EMPLOYEES: {
        return {
          ...state,
          loading: false,
          salesTransferByEmployees: action.payload,
        };
      }
      case actionTypes.LIST_SALE_BY_EMPLOYEES: {
        const newSalesByEmployees = state.salesByEmployees;

        let lastNonIngresoIndex = -1;

        newSalesByEmployees[action.payload.employee].forEach(
          (sale: any, idx: number) => {
            if (!sale.type) {
              lastNonIngresoIndex = idx;
            }
          }
        );

        const findValue = newSalesByEmployees[action.payload.employee].find(
          (sale: any) => sale.id === action.payload.id
        );

        if (!findValue) {
          newSalesByEmployees[action.payload.employee].splice(
            lastNonIngresoIndex + 1,
            0,
            action.payload
          );
        }

        return {
          ...state,
          loading: false,
          error: null,
          showSuccessToast: true,
          showSuccessToastMsg: "Venta Ingresada",
          salesByEmployees: newSalesByEmployees,
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
  getReports:
    ({ month, year, store, typeSale }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.getReports({
          month,
          year,
          store,
          typeSale,
        });

        dispatch({
          type: actionTypes.LIST_REPORTS,
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
  getOrders:
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
        const { data } = await Api.getOrders({
          startDate,
          endDate,
          typeSale,
          store,
          employee,
          typeShipment,
          checkoutDate,
        });

        dispatch({
          type: actionTypes.LIST_ORDERS,
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
  getSalesCashByDay:
    ({ date, store }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.getSalesCashByDay({
          date,
          store,
        });

        dispatch({
          type: actionTypes.LIST_SALES_BY_EMPLOYEES,
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
  getSalesTranferByDay:
    ({ date, store }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.getSalesTranferByDay({
          date,
          store,
        });

        dispatch({
          type: actionTypes.LIST_SALES_TRANSFER_BY_EMPLOYEES,
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
      numOrder,
      typeShipment,
      percentageCash,
      percentageTransfer,
      cashWithDisccount,
      transferWithRecharge,
      totalCash,
      totalTransfer,
      totalToPay,
      totalFinal,
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
          numOrder,
          typeShipment,
          percentageCash,
          percentageTransfer,
          cashWithDisccount,
          transferWithRecharge,
          totalCash,
          totalTransfer,
          totalToPay,
          totalFinal,
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
  addNewSaleByEmployee:
    ({ items, cash, total, employee, store, username }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.addNewSaleByEmployee({
          items,
          cash,
          total,
          employee,
          store,
          username,
        });

        dispatch({
          type: actionTypes.LIST_SALE_BY_EMPLOYEES,
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
  addNewRowSale:
    ({ emp }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.ADD_NEW_ROW_SALE,
        payload: emp,
      });
    },
  removeEmptyRows:
    ({ emp }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.REMOVE_EMPTY_ROW,
        payload: emp,
      });
    },
  updateOrder:
    ({ id, dataIndex, value, onlyOneField }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.updateOrder({
          id,
          dataIndex,
          value,
          onlyOneField,
        });

        dispatch({
          type: actionTypes.UPDATE_ORDER,
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
  updateSaleByEmployee:
    ({ id, dataIndex, value }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.updatSaleByEmployee({
          id,
          dataIndex,
          value,
        });

        dispatch({
          type: actionTypes.UPDATE_SALE_BY_EMPLOYEE,
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
  cancelOrders:
    ({ itemsIdSelected }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.cancelOrders({
          itemsIdSelected,
        });

        dispatch({
          type: actionTypes.CANCEL_ORDERS,
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

  removeSales:
    ({ salesIds, cashflowIds }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        await Api.removeSales({
          salesIds,
          cashflowIds,
        });

        dispatch({
          type: actionTypes.REMOVE_SALES,
          payload: { salesIds, cashflowIds },
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
      typeSale,
      numOrder,
      pricesWithconcepts,
      pricesDevolutionWithconcepts,
      totalPrices,
      totalDevolutionPrices,
      percentageCash,
      percentageTransfer,
      cashWithDisccount,
      transferWithRecharge,
      totalCash,
      totalTransfer,
      totalToPay,
      total,
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
          typeSale,
          numOrder,
          pricesWithconcepts,
          pricesDevolutionWithconcepts,
          totalPrices,
          totalDevolutionPrices,
          percentageCash,
          percentageTransfer,
          cashWithDisccount,
          transferWithRecharge,
          totalCash,
          totalTransfer,
          totalToPay,
          total,
        });

        dispatch({
          type: actionTypes.SUCCESS_PRINT,
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
  getLastNumOrder: (seller: any) => async (dispatch: any) => {
    dispatch({
      type: actionTypes.LOADING,
      payload: { loading: true },
    });

    try {
      const { data } = await Api.getLastNumOrder({
        seller,
      });

      dispatch({
        type: actionTypes.LAST_NUM_ORDER_BY_SELLER,
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
