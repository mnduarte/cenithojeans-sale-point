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
    total,
  });

const printSale = ({
  pricesSelected,
  devolutionPricesSelected,
  percentageToDisccountOrAdd,
  username,
  seller,
  totalPrice,
}: any) =>
  instance.post("/sale/print-sale", {
    pricesSelected,
    devolutionPricesSelected,
    percentageToDisccountOrAdd,
    username,
    seller,
    totalPrice,
  });

const Api = {
  login,

  getStores,

  getPrices,
  addPrice,
  updatePrice,
  removePrice,

  getEmployees,
  addEmployee,
  updateEmployee,
  removeEmployee,

  addSale,
  printSale,
  getSales,
};

export default Api;
