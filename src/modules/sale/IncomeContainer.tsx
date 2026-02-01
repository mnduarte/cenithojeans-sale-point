import { useState } from "react";
import { MdClose } from "react-icons/md";
import KeyboardNum from "../../components/KeyboardNum";
import { useEmployee } from "../../contexts/EmployeeContext";
import { cashflowActions, useCashflow } from "../../contexts/CashflowContext";
import { useCashier } from "../../contexts/CashierContext";
import Spinner from "../../components/Spinner";
import Toast from "../../components/Toast";
import Keyboard from "../../components/Keyboard";
import { DatePicker, Select } from "antd";
import { useTheme } from "../../contexts/ThemeContext";
import { dateFormat } from "../../utils/constants";
import { formatDateToYYYYMMDD } from "../../utils/formatUtils";
import dayjs from "dayjs";

const initialValuesProps = {
  amount: 0,
  items: 0,
  typePayment: "cash",
  date: formatDateToYYYYMMDD(new Date()),
};

const IncomeContainer = ({ isModalIncomeOpen, setIsModalIncomeOpen }: any) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();
  const {
    state: { employees },
  } = useEmployee();
  const {
    state: {
      loading: loadingCashflow,
      showSuccessToast,
      showSuccessToastMsg,
      showErrorToast,
    },
    dispatch: dispatchCashflow,
  } = useCashflow();

  const { selectedCashier } = useCashier();

  const [propsValues, setPropsValues] = useState<any>(initialValuesProps);
  const [dataIndex, setDataIndex] = useState("");
  const [sellerSelected, setSellerSelected] = useState("");
  const [description, setDescription] = useState("");
  const [isModalKeyboardNumOpen, setIsModalKeyboardNumOpen] = useState(false);

  const closeModal = () => {
    setSellerSelected("");
    setDataIndex("");
    setPropsValues(initialValuesProps);
    setIsModalIncomeOpen(false);
    setDescription("");
  };

  const handleIncome = () => {
    const foundEmployee = employees.find((emp) => emp.name === sellerSelected);

    const data = {
      type: "ingreso",
      employee: sellerSelected,
      store: foundEmployee.store,
      description,
      amount: propsValues.amount,
      items: propsValues.items,
      typePayment: propsValues.typePayment,
      date: propsValues.date,
      cashierId: selectedCashier?.id || null,
      cashierName: selectedCashier?.name || null,
    };

    dispatchCashflow(cashflowActions.addCashflow(data)(dispatchCashflow));
    setSellerSelected("");
    setDataIndex("");
    setPropsValues(initialValuesProps);
    setDescription("");
  };

  const handleManualNumOrder = (item: any) => {
    if (item.action === "deleteLast") {
      return setPropsValues((currentValue: any) => ({
        ...currentValue,
        [dataIndex]: Number(String(currentValue[dataIndex]).slice(0, -1)),
      }));
    }

    if (item.action === "addPrice") {
      return setIsModalKeyboardNumOpen(false);
    }

    setPropsValues((currentValue: any) => ({
      ...currentValue,
      [dataIndex]: Number(String(currentValue[dataIndex]) + String(item.value)),
    }));
  };

  const isFormValid = Boolean(sellerSelected.length) && Boolean(propsValues.amount);

  return (
    <>
      {isModalIncomeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`w-[62vh] rounded-lg shadow-xl relative ${themeStyles[theme].tailwindcss.modal}`}
            style={{ border: "1px solid #3f3f46" }}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-100">Agregar Ingreso</h2>
              </div>
              <button
                className="text-gray-400 hover:text-gray-200 p-1 rounded transition-colors"
                onClick={closeModal}
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            {/* Cajero badge */}
            {selectedCashier && (
              <div className="px-6 py-2 bg-gray-700/30 border-b border-gray-700">
                <span className="text-xs text-gray-400">Cajero: </span>
                <span className="text-sm text-gray-200 font-medium inline-flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: selectedCashier.color }}
                  />
                  {selectedCashier.name}
                </span>
              </div>
            )}

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Vendedor y Fecha */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Vendedor</label>
                  <Select
                    value={sellerSelected || undefined}
                    className={themeStyles[theme].classNameSelector}
                    dropdownStyle={{
                      ...themeStyles[theme].dropdownStylesCustom,
                      width: 200,
                    }}
                    popupClassName={themeStyles[theme].classNameSelectorItem}
                    style={{ width: "100%" }}
                    placeholder="Seleccione"
                    onSelect={(value: any) => setSellerSelected(value)}
                    options={employees.map((data: any) => ({
                      value: data.name,
                      label: data.name,
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Fecha</label>
                  <DatePicker
                    onChange={(date: any) =>
                      setPropsValues((current: any) => ({
                        ...current,
                        date: date.format("YYYY-MM-DD"),
                      }))
                    }
                    className={`${themeStyles[theme].datePickerIndicator}`}
                    style={{ ...themeStyles[theme].datePicker, width: "100%" }}
                    popupClassName={themeStyles[theme].classNameDatePicker}
                    allowClear={false}
                    format={dateFormat}
                    value={dayjs(propsValues.date)}
                  />
                </div>
              </div>

              {/* Items e Importe */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Cantidad Items</label>
                  <input
                    type="text"
                    className={`w-full p-2.5 rounded-md text-center font-medium ${themeStyles[theme].tailwindcss.inputText}`}
                    readOnly
                    value={propsValues.items}
                    onFocus={() => {
                      setDataIndex("items");
                      setIsModalKeyboardNumOpen(true);
                    }}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Importe</label>
                  <input
                    type="text"
                    className={`w-full p-2.5 rounded-md text-center font-medium ${themeStyles[theme].tailwindcss.inputText}`}
                    readOnly
                    value={propsValues.amount}
                    onFocus={() => {
                      setDataIndex("amount");
                      setIsModalKeyboardNumOpen(true);
                    }}
                    placeholder="$0"
                  />
                </div>
              </div>

              {/* Tipo de Pago */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tipo de Pago</label>
                <div className="flex gap-3">
                  <button
                    className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all border ${
                      propsValues.typePayment === "cash"
                        ? "bg-gray-600 border-gray-500 text-white"
                        : "bg-transparent border-gray-600 text-gray-400 hover:border-gray-500"
                    }`}
                    onClick={() =>
                      setPropsValues((current: any) => ({
                        ...current,
                        typePayment: "cash",
                      }))
                    }
                  >
                    Efectivo
                  </button>
                  <button
                    className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all border ${
                      propsValues.typePayment === "transfer"
                        ? "bg-gray-600 border-gray-500 text-white"
                        : "bg-transparent border-gray-600 text-gray-400 hover:border-gray-500"
                    }`}
                    onClick={() =>
                      setPropsValues((current: any) => ({
                        ...current,
                        typePayment: "transfer",
                      }))
                    }
                  >
                    Transferencia
                  </button>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Descripción</label>
                <input
                  type="text"
                  value={description}
                  readOnly
                  className={`w-full p-2.5 rounded-md ${themeStyles[theme].tailwindcss.inputText}`}
                  placeholder="Ingrese descripción..."
                />
              </div>

              {/* Keyboard */}
              <Keyboard
                onKeyPress={(e: any) => {
                  let newDescription = description;
                  if (e.action === "deleteLast") {
                    newDescription = newDescription.slice(0, -1);
                  }
                  if (e.action === "addSpace") {
                    newDescription = newDescription + " ";
                  }
                  if (!e.action) {
                    newDescription = newDescription + e.value.toLowerCase();
                  }
                  setDescription(newDescription);
                }}
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-700 flex gap-3">
              <button
                className="flex-1 py-2.5 px-4 rounded-md text-sm font-medium bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
                onClick={closeModal}
              >
                Cancelar
              </button>
              <button
                className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  isFormValid
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
                onClick={() => isFormValid && handleIncome()}
                disabled={!isFormValid}
              >
                {loadingCashflow ? <Spinner /> : "Guardar"}
              </button>
            </div>
          </div>

          <KeyboardNum
            isModalKeyboardNumOpen={isModalKeyboardNumOpen}
            manualNum={propsValues[dataIndex]}
            handleManualNum={handleManualNumOrder}
            closeModal={() => setIsModalKeyboardNumOpen(false)}
            title={dataIndex === "items" ? "Ingrese cantidad" : "Ingrese importe"}
          />

          {showSuccessToast && (
            <Toast
              type="success"
              message={showSuccessToastMsg}
              onClose={() =>
                dispatchCashflow(cashflowActions.setHideToasts()(dispatchCashflow))
              }
            />
          )}

          {showErrorToast && (
            <Toast
              type="error"
              message={showSuccessToastMsg}
              onClose={() =>
                dispatchCashflow(cashflowActions.setHideToasts()(dispatchCashflow))
              }
            />
          )}
        </div>
      )}
    </>
  );
};

export default IncomeContainer;
