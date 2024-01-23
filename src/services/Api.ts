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
const addEmployee = ({ name, store, active }: any) =>
  instance.post("/employee/add-employee", { name, store, active });

const updateEmployee = ({ id, name, store, active }: any) =>
  instance.put("/employee/update-employee", { id, name, store, active });

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
}: any) => {
  const config: AxiosRequestConfig = {
    params: {
      startDate,
      endDate,
      typeSale,
      store,
      employee,
      typeShipment,
    },
  };

  return instance.get("/sale/orders", config);
};

const getSalesByDay = ({ date, store }: any) => {
  const config: AxiosRequestConfig = {
    params: {
      date,
      store,
    },
  };

  return instance.get("/sale/sales-by-employees", config);
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
  total,
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
    total,
  });

const addNewSaleByEmployee = ({
  items,
  total,
  employee,
  store,
  username,
}: any) =>
  instance.post("/sale/add-sale-by-employee", {
    items,
    total,
    employee,
    store,
    username,
  });

const updateOrder = ({ id, dataIndex, value }: any) =>
  instance.put("/sale/update-order", { id, dataIndex, value });

const updatSaleByEmployee = ({ id, dataIndex, value }: any) =>
  instance.put("/sale/update-sale-by-employee", { id, dataIndex, value });

const cancelOrders = ({ itemsIdSelected }: any) =>
  instance.post("/sale/cancel-order", { itemsIdSelected });

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
  totalPrice,
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
    totalPrice,
  });

const addCashflow = ({ type, amount, employee, store, description }: any) =>
  instance.post("/cashflow/add-cashflow", {
    type,
    amount,
    employee,
    store,
    description,
  });

const addObservation = ({ observation, store, username }: any) =>
  instance.post("/observation/add-observation", {
    observation,
    store,
    username,
  });

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
  addNewSaleByEmployee,
  updateOrder,
  updatSaleByEmployee,
  cancelOrders,
  printSale,
  getSales,
  getOrders,
  getSalesByDay,
  getCashflowByDay,

  addCashflow,
  addObservation,
};

export default Api;
