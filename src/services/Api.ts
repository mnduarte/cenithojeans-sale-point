import { AxiosRequestConfig } from "axios";
import axios from "../utils/axios";

const instance = axios.instance;

const login = ({ username, password }: any) =>
  instance.post("/user/login", { username, password });

const getStores = () => instance.get("/store/stores/");

const getPrices = () => instance.get("/price/prices");
const addPrice = ({ price, active }: any) =>
  instance.post("/price/add-price", { price, active });

const updatePrice = ({ id, price, active }: any) =>
  instance.put("/price/update-price", { id, price, active });

const removePrice = ({ id }: any) =>
  instance.delete(`/price/remove-price/${id}`);

const deleteSelectedPrices = ({ itemsIdSelected, deleteAll }: any) =>
  instance.post("/price/delete-selected-price", { itemsIdSelected, deleteAll });

const getEmployees = ({ store }: any) =>
  instance.post("/employee/employees/", { store });
const addEmployee = ({ name, store, position, active, activeForCost }: any) =>
  instance.post("/employee/add-employee", {
    name,
    store,
    position,
    active,
    activeForCost,
  });

const updateEmployee = ({
  id,
  name,
  store,
  position,
  active,
  activeForCost,
}: any) =>
  instance.put("/employee/update-employee", {
    id,
    name,
    store,
    position,
    active,
    activeForCost,
  });

const removeEmployee = ({ id }: any) =>
  instance.delete(`/employee/remove-employee/${id}`);

const getSales = ({ startDate, endDate, store, employee }: any) => {
  const config: AxiosRequestConfig = {
    params: {
      startDate,
      endDate,
      store,
      employee,
    },
  };

  return instance.get("/sale/sales", config);
};

const getOrders = ({
  startDate,
  endDate,
  typeSale,
  store,
  employee,
  typeShipment,
  checkoutDate,
}: any) => {
  const config: AxiosRequestConfig = {
    params: {
      startDate,
      endDate,
      typeSale,
      store,
      employee,
      typeShipment,
      checkoutDate,
    },
  };

  return instance.get("/sale/orders", config);
};

const getOrdersCheckoutDate = ({
  startDate,
  endDate,
  typeSale,
  store,
  typeShipment,
  employee,
}: any) => {
  const config: AxiosRequestConfig = {
    params: {
      startDate,
      endDate,
      typeSale,
      store,
      typeShipment,
      employee,
    },
  };

  return instance.get("/sale/orders-checkoutdate", config);
};

const getReports = ({ month, year, store, typeSale }: any) => {
  const config: AxiosRequestConfig = {
    params: {
      month,
      year,
      store,
      typeSale,
    },
  };

  return instance.get("/sale/reports", config);
};

const getObservations = ({ month, year, store }: any) => {
  const config: AxiosRequestConfig = {
    params: {
      month,
      year,
      store,
    },
  };

  return instance.get("/observation/observations", config);
};

const getSalesCashByDay = ({ date, store }: any) => {
  const config: AxiosRequestConfig = {
    params: {
      date,
      store,
    },
  };

  return instance.get("/sale/sales-cash-by-employees", config);
};

const getSalesTranferByDay = ({ date, store }: any) => {
  const config: AxiosRequestConfig = {
    params: {
      date,
      store,
    },
  };

  return instance.get("/sale/sales-transfer-by-employees", config);
};

const getCashflowByDay = ({ date, store }: any) => {
  const config: AxiosRequestConfig = {
    params: {
      date,
      store,
    },
  };

  return instance.get("/cashflow/cashflow-by-day", config);
};

const getOutgoingsByDay = ({ date, store }: any) => {
  const config: AxiosRequestConfig = {
    params: {
      date,
      store,
    },
  };

  return instance.get("/cashflow/outgoings-by-day", config);
};

const addSale = ({
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
  isWithPrepaid,
}: any) =>
  instance.post("/sale/add-sale", {
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
    isWithPrepaid,
  });

const addNewNumOrder = ({ employeeId, newNumOrder }: any) =>
  instance.post("/employee/add-new-num-order", {
    employeeId,
    newNumOrder,
  });

const addNewSaleByEmployee = ({
  items,
  cash,
  total,
  employee,
  store,
  username,
}: any) =>
  instance.post("/sale/add-sale-by-employee", {
    items,
    cash,
    total,
    employee,
    store,
    username,
  });

const updateOrder = ({ id, dataIndex, value }: any) =>
  instance.put("/sale/update-order", { id, dataIndex, value });

const updatSaleByEmployee = ({ id, dataIndex, value }: any) =>
  instance.put("/sale/update-sale-by-employee", { id, dataIndex, value });

const updateCashflow = ({ id, dataIndex, value }: any) =>
  instance.put("/cashflow/update-cashflow", { id, dataIndex, value });

const cancelOrders = ({ itemsIdSelected }: any) =>
  instance.post("/sale/cancel-order", { itemsIdSelected });

const removeSales = ({ salesIds, cashflowIds }: any) =>
  instance.post("/sale/remove-sale", { salesIds, cashflowIds });

const removeCashflows = ({ cashflowIds }: any) =>
  instance.post("/cashflow/remove-cashflow", { cashflowIds });

const getLastNumOrder = ({ seller }: any) =>
  instance.post("/sale/last-num-order-by-seller", { seller });

const printSale = ({
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
  instance.post("/sale/print-sale", {
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

const addCashflow = ({
  type,
  amount,
  employee,
  store,
  description,
  items,
  typePayment,
  date,
}: any) =>
  instance.post("/cashflow/add-cashflow", {
    type,
    amount,
    employee,
    store,
    description,
    items,
    typePayment,
    date,
  });

const addObservation = ({ observation, store, username }: any) =>
  instance.post("/observation/add-observation", {
    observation,
    store,
    username,
  });

const getGraphData = ({ startDate, endDate, store }: any) => {
  const config: AxiosRequestConfig = {
    params: {
      startDate,
      endDate,
      store,
    },
  };

  return instance.get("/graph/get-data", config);
};

const deleteData = ({ startDate, endDate }: any) => {
  const config: AxiosRequestConfig = {
    params: {
      startDate,
      endDate,
    },
  };

  return instance.get("/admin/delete-data", config);
};

/**COSTS */
const getCosts = ({
  startDate,
  endDate,
  accounts,
  employees,
  typeShipment,
  checkoutDate,
  store,
}: any) => {
  const config: AxiosRequestConfig = {
    params: {
      startDate,
      endDate,
      accounts,
      employees,
      typeShipment,
      checkoutDate,
      store,
    },
  };

  return instance.get("/cost/costs", config);
};

const getCostsByDateApproved = ({ dateApproved }: any) => {
  const config: AxiosRequestConfig = {
    params: {
      dateApproved,
    },
  };

  return instance.get("/cost/costs-by-date-approved", config);
};

const addCost = ({
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
}: any) =>
  instance.post("/cost/add-cost", {
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
  });

const updateCost = ({
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
}: any) =>
  instance.put("/cost/update-cost", {
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
  });

const removeCosts = ({ costsIds }: any) =>
  instance.post("/cost/remove-cost", { costsIds });

/** ACCOUNTS */
const getAccounts = ({}: any) => {
  const config: AxiosRequestConfig = {
    params: {},
  };

  return instance.get("/cost/accounts", config);
};

const addAccount = ({ name }: any) =>
  instance.post("/cost/add-account", {
    name,
  });

const updateAccount = ({ id, name }: any) =>
  instance.put("/cost/update-account", {
    id,
    name,
  });

const removeAccounts = ({ accountsIds }: any) =>
  instance.post("/cost/remove-account", { accountsIds });

const Api = {
  login,

  getStores,

  getPrices,
  addPrice,
  updatePrice,
  removePrice,
  deleteSelectedPrices,

  getEmployees,
  addEmployee,
  updateEmployee,
  removeEmployee,

  addSale,
  addNewNumOrder,
  addNewSaleByEmployee,
  updateOrder,
  updatSaleByEmployee,
  updateCashflow,
  cancelOrders,
  removeSales,
  removeCashflows,
  printSale,
  getSales,
  getOrders,
  getOrdersCheckoutDate,
  getReports,
  getObservations,
  getSalesCashByDay,
  getSalesTranferByDay,
  getCashflowByDay,
  getOutgoingsByDay,

  addCashflow,
  addObservation,

  getLastNumOrder,

  getGraphData,

  deleteData,

  getCosts,
  getCostsByDateApproved,
  addCost,
  updateCost,
  removeCosts,

  getAccounts,
  addAccount,
  updateAccount,
  removeAccounts,
};

export default Api;
