import { useState } from "react";
import { saleActions, useSale } from "../contexts/SaleContext";
import { formatCurrency, formatDateToYYYYMMDD } from "../utils/formatUtils";
import Spinner from "../components/Spinner";
import { useUser } from "../contexts/UserContext";
import KeyboardNum from "../components/KeyboardNum";
import Toast from "../components/Toast";
import EditableTable from "../components/EditableTable";
import { FaPlus } from "react-icons/fa";
import { GrPowerReset } from "react-icons/gr";
import NewRowSale from "../containers/NewRowSale";
import { cashflowActions, useCashflow } from "../contexts/CashflowContext";
import NewNumOrder from "./NewNumOrder";
import dayjs from "dayjs";

import { DatePicker, Select } from "antd";
import SelectCustom from "../components/SelectCustom";
import {
  darkTheme,
  dateFormat,
  listStore,
  mappingListStore,
} from "../utils/constants";
import { useTheme } from "../contexts/ThemeContext";

const mappingConceptToUpdate: Record<string, string> = {
  cash: "Efectivo",
  transfer: "Transferencia",
  items: "Prendas",
  total: "Total",
};

const SalesByDayContainer = () => {
  const {
    state: { theme, themeStyles },
  } = useTheme();

  const {
    state: {
      salesByEmployees,
      loading,
      showSuccessToast,
      showErrorToast,
      showSuccessToastMsg,
    },
    dispatch: dispatchSale,
  } = useSale();
  const {
    state: { user },
  } = useUser();

  const {
    state: { loading: loadingCashflow, incomes, outgoings },
    dispatch: dispatchCashflow,
  } = useCashflow();
  const [date, setDate] = useState(formatDateToYYYYMMDD(new Date()));
  const [store, setStore] = useState(user.store);
  const [value, setValue] = useState(0);
  const [propSale, setPropSale] = useState({
    id: "",
    dataIndex: "",
  });
  const [isModalKeyboardNumOpen, setIsModalKeyboardNumOpen] = useState(false);
  const [isModalNewRowSale, setIsModalNewRowSale] = useState(false);
  const [isModalNewNumOrder, setIsModalNewNumOrder] = useState(false);
  const [itemsIdSelected, setItemsIdSelected] = useState<any[]>([]);

  const [editableRow, setEditableRow] = useState<number | null>(null);
  const [employeeSelectedForNewRowSale, setEmployeeSelectedForNewRowSale] =
    useState("");

  const columns = [
    { title: "N°", dataIndex: "order", size: "w-5" },
    {
      title: "Prendas",
      dataIndex: "items",
      editableCell: true,
      type: "string",
      sumAcc: true,
    },
    {
      title: "Total",
      dataIndex: "total",
      format: (number: any) => `$${formatCurrency(number)}`,
      editableCell: true,
      type: "string",
      sumAcc: user.role === "ADMIN",
      applyFormat: true,
    },
  ];

  const columnsIncome = [
    {
      title: "Vendedor",
      dataIndex: "employee",
    },
    {
      title: "Prendas",
      dataIndex: "items",
    },
    {
      title: "Importe",
      dataIndex: "amount",
      format: (number: any) => `$${formatCurrency(number)}`,
      sumAcc: user.role === "ADMIN",
      applyFormat: true,
    },
    {
      title: "Detalle",
      dataIndex: "description",
    },
  ];

  const columnsOutgoing = [
    {
      title: "Detalle",
      dataIndex: "description",
    },
    {
      title: "Importe",
      dataIndex: "amount",
      format: (number: any) => `$${formatCurrency(number)}`,
      sumAcc: user.role === "ADMIN",
      applyFormat: true,
    },
  ];

  const handleEditClick = (rowIndex: number) => {
    dispatchSale(
      saleActions.removeEmptyRows({ emp: employeeSelectedForNewRowSale })(
        dispatchSale
      )
    );
    setEmployeeSelectedForNewRowSale("");
    setEditableRow(rowIndex);
  };

  const handleManualValue = (item: any) => {
    if (item.action === "deleteLast") {
      return setValue((currentValue: any) =>
        Number(String(currentValue).slice(0, -1))
      );
    }

    if (item.action === "addPrice") {
      dispatchSale(
        saleActions.updateSaleByEmployee({ ...propSale, value })(dispatchSale)
      );

      setValue(0);
      setEditableRow(null);

      return setIsModalKeyboardNumOpen(false);
    }

    setValue((currentValue: any) =>
      Number(String(currentValue) + String(item.value))
    );
  };

  const handleAction = ({ dataIndex, value, id, inputType }: any) => {
    if (inputType === "string") {
      setPropSale({ dataIndex, id });
      setValue(value ? value : 0);
      setIsModalKeyboardNumOpen(true);
    }
  };

  const handleNewRowSale = ({ emp }: any) => {
    setEmployeeSelectedForNewRowSale(emp);
    setIsModalNewRowSale(true);
  };

  const handleCountNumOrderByEmployee = ({ emp }: any) => {
    setEmployeeSelectedForNewRowSale(emp);
    setIsModalNewNumOrder(true);
  };

  return (
    <>
      <div className={`h-10 relative p-2 border ${themeStyles[theme].tailwindcss.border} flex items-center`}>
        <div className="inline-block">
          <label className="mr-2">Fecha:</label>

          <DatePicker
            onChange={(date: any) => setDate(date.format("YYYY-MM-DD"))}
            className={themeStyles[theme].datePickerIndicator}
            style={themeStyles[theme].datePicker}
            popupClassName={themeStyles[theme].classNameDatePicker}
            allowClear={false}
            format={dateFormat}
            value={dayjs(date)}
          />
        </div>

        {user.store === "ALL" && (
          <div className="ml-4 inline-block">
            <label className="mr-2">Filtrar por sucursal:</label>

            <Select
              value={mappingListStore[store]}
              className={themeStyles[theme].classNameSelector}
              dropdownStyle={themeStyles[theme].dropdownStylesCustom}
              popupClassName={themeStyles[theme].classNameSelectorItem}
              style={{ width: 110 }}
              onSelect={(value: any) => setStore(value)}
              options={listStore.map((data: any) => ({
                value: data.value,
                label: data.name,
              }))}
            />
          </div>
        )}

        <div
          className="ml-5
         inline-block"
        >
          <div
            className={`inline-block px-4 py-1 rounded-md border text-white select-none ${
              Boolean(date.length) &&
              "bg-[#1b78e2] border-[#1b78e2] hover:cursor-pointer hover:opacity-80 transition-opacity"
            } flex items-center mx-auto`}
            onClick={() => {
              !loading &&
                dispatchSale(
                  saleActions.getSalesByDay({ date, store })(dispatchSale)
                );
              !loading &&
                dispatchCashflow(
                  cashflowActions.getCashFlowByDay({ date, store })(
                    dispatchCashflow
                  )
                );
            }}
          >
            Buscar
            {loading && (
              <div className="ml-2">
                <Spinner />
              </div>
            )}
          </div>
        </div>

        {Boolean(itemsIdSelected.length) && (
          <div
            className="w-25 ml-2 bg-red-700 hover:bg-red-800 hover:cursor-pointer text-white px-4 py-1 rounded-md flex items-center justify-center select-none"
            onClick={() => {
              setItemsIdSelected([]);
              dispatchSale(
                saleActions.removeSales({
                  itemsIdSelected,
                })(dispatchSale)
              );
            }}
          >
            Eliminar Pedidos Seleccionados
          </div>
        )}
      </div>

      <div className="mt-5 h-[58vh] mx-auto max-w overflow-hidden overflow-y-auto overflow-x-auto">
        <div className="flex gap-2">
          {Boolean(Object.entries(salesByEmployees).length) &&
            Object.entries(salesByEmployees).map(
              (saleByEmployee: any, idx: number) => {
                const [emp, sales] = saleByEmployee;
                return (
                  <div className="w-50" key={emp}>
                    <div className="mb-2 flex ">
                      <label className="text-2xl text-base font-bold mr-3 ml-auto">
                        {emp}
                      </label>
                      <div
                        className={`w-6 text-white bg-red-600 hover:cursor-pointer hover:bg-red-700 flex items-center justify-center rounded-md mr-1`}
                        onClick={() => handleCountNumOrderByEmployee({ emp })}
                      >
                        <GrPowerReset />
                      </div>
                      <div
                        className={`w-6 text-white bg-green-600 hover:cursor-pointer hover:bg-green-700 flex items-center justify-center rounded-md`}
                        onClick={() => handleNewRowSale({ emp })}
                      >
                        <FaPlus />
                      </div>
                    </div>
                    <EditableTable
                      data={sales}
                      columns={columns}
                      table={`${idx}-`}
                      handleAction={handleAction}
                      editableRow={editableRow}
                      handleEditClick={handleEditClick}
                      itemsIdSelected={itemsIdSelected}
                      setItemsIdSelected={setItemsIdSelected}
                      enableSelectItem={true}
                    />
                  </div>
                );
              }
            )}
        </div>
      </div>
      <div className="h-[20vh] border-y border-grey-800 mx-auto max-w overflow-hidden overflow-y-auto overflow-x-auto">
        <div className="flex gap-2">
          {Boolean(incomes.length) && (
            <div className="w-50">
              <div className="mb-2 flex ">
                <label className="text-2xl text-base font-bold mr-4">
                  Ingresos
                </label>
              </div>
              <EditableTable
                data={incomes}
                columns={columnsIncome}
                table={`-`}
              />
            </div>
          )}
          {Boolean(outgoings.length) && (
            <div className="w-50">
              <div className="mb-2 flex ">
                <label className="text-2xl text-base font-bold mr-4">
                  Egresos
                </label>
              </div>
              <EditableTable
                data={outgoings}
                columns={columnsOutgoing}
                table={`-`}
              />
            </div>
          )}
        </div>
      </div>

      <KeyboardNum
        isModalKeyboardNumOpen={isModalKeyboardNumOpen}
        manualNum={value}
        handleManualNum={handleManualValue}
        closeModal={() => {
          dispatchSale(
            saleActions.removeEmptyRows({ emp: employeeSelectedForNewRowSale })(
              dispatchSale
            )
          );
          setValue(0);
          setEditableRow(null);
          setEmployeeSelectedForNewRowSale("");
          setIsModalKeyboardNumOpen(false);
        }}
        title={"Ingrese " + mappingConceptToUpdate[propSale.dataIndex]}
      />

      <NewRowSale
        isModalNewRowSale={isModalNewRowSale}
        setIsModalNewRowSale={setIsModalNewRowSale}
        employee={employeeSelectedForNewRowSale}
      />

      <NewNumOrder
        isModalNewNumOrder={isModalNewNumOrder}
        setIsModalNewNumOrder={setIsModalNewNumOrder}
        employee={employeeSelectedForNewRowSale}
      />

      {showSuccessToast && (
        <Toast
          type="success"
          message={showSuccessToastMsg}
          onClose={() =>
            dispatchSale(saleActions.setHideToasts()(dispatchSale))
          }
        />
      )}

      {showErrorToast && (
        <Toast
          type="error"
          message={showSuccessToastMsg}
          onClose={() =>
            dispatchSale(saleActions.setHideToasts()(dispatchSale))
          }
        />
      )}
    </>
  );
};

export default SalesByDayContainer;
