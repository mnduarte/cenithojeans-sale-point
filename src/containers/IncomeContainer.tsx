import { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import KeyboardNum from "../components/KeyboardNum";
import { useEmployee } from "../contexts/EmployeeContext";
import { cashflowActions, useCashflow } from "../contexts/CashflowContext";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";
import Keyboard from "../components/Keyboard";
import { Select } from "antd";
import { useTheme } from "../contexts/ThemeContext";

const initialValuesProps = {
  amount: 0,
  items: 0,
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

  return (
    <>
      {isModalIncomeOpen && (
        <div className="fixed inset-0 bg-[#252525] bg-opacity-60 flex items-center justify-center">
          {/* Contenido del modal */}
          <div className={`w-[60vh] p-8 rounded-md shadow-md relative ${themeStyles[theme].tailwindcss.modal}`}>
            {/* Icono de cerrar en la esquina superior derecha */}
            <button
              className="absolute top-4 right-4"
              onClick={closeModal}
            >
              <MdClose className="text-2xl" />
            </button>

            <h2 className="text-lg font-bold mb-4">
              Agregar Ingreso
            </h2>

            <div className="mb-2 inline-block">
              <label className="mr-2">Seleccione Vendedor:</label>

              <Select
                value={sellerSelected}
                className={themeStyles[theme].classNameSelector}
                dropdownStyle={{
                  ...themeStyles[theme].dropdownStylesCustom,
                  width: 160,
                }}
                popupClassName={themeStyles[theme].classNameSelectorItem}
                style={{ width: 160 }}
                onSelect={(value: any) => setSellerSelected(value)}
                options={employees.map((data: any) => ({
                  value: data.name,
                  label: data.name,
                }))}
              />
            </div>

            <div className="mb-2 h-[5vh] flex items-center justify-start">
              <label className="mr-2">Agrege items:</label>

              <input
                type="text"
                className={`w-[10vh] p-2 rounded-md mr-2 ${themeStyles[theme].tailwindcss.inputText}`}
                readOnly
                value={propsValues.items}
                onFocus={() => {
                  setDataIndex("items");
                  setIsModalKeyboardNumOpen(true);
                }}
              />
            </div>

            <div className="mb-2 h-[5vh] flex items-center justify-start">
              <label className="mr-2">Agrege importe:</label>

              <input
                type="text"
                className={`w-[10vh] p-2 rounded-md mr-2 ${themeStyles[theme].tailwindcss.inputText}`}
                readOnly
                value={propsValues.amount}
                onFocus={() => {
                  setDataIndex("amount");
                  setIsModalKeyboardNumOpen(true);
                }}
              />
            </div>

            <div className="mb-2">
              <label className="mb-2 h-[5vh] flex items-center justify-start">
                Descripcion:
              </label>
              <input
                type="text"
                value={description}
                readOnly
                className={`w-[30vh] p-2 rounded-md mr-2 ${themeStyles[theme].tailwindcss.inputText}`}
              />
            </div>

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

            <br />

            <div className="flex space-x-4">
              <div
                className="w-1/2 bg-blue-800 hover:bg-blue-800 hover:cursor-pointer text-white px-4 py-2 rounded-md flex items-center justify-center mx-auto select-none"
                onClick={closeModal}
              >
                Cancelar
              </div>
              <div
                className={`${
                  !Boolean(sellerSelected.length) ||
                  !Boolean(propsValues.amount) ||
                  !Boolean(propsValues.items)
                    ? "bg-gray-500"
                    : "bg-green-800 hover:bg-green-800 hover:cursor-pointer"
                }  w-1/2 text-white px-4 py-2 rounded-md flex items-center justify-center mx-auto select-none `}
                onClick={() =>
                  Boolean(sellerSelected.length) &&
                  Boolean(propsValues.amount) &&
                  Boolean(propsValues.items) &&
                  handleIncome()
                }
              >
                Guardar
                {loadingCashflow && (
                  <div className="ml-2">
                    <Spinner />
                  </div>
                )}
              </div>
            </div>
          </div>
          <KeyboardNum
            isModalKeyboardNumOpen={isModalKeyboardNumOpen}
            manualNum={propsValues[dataIndex]}
            handleManualNum={handleManualNumOrder}
            closeModal={() => {
              setIsModalKeyboardNumOpen(false);
            }}
            title={`Ingrese valor`}
          />
          {showSuccessToast && (
            <Toast
              type="success"
              message={showSuccessToastMsg}
              onClose={() =>
                dispatchCashflow(
                  cashflowActions.setHideToasts()(dispatchCashflow)
                )
              }
            />
          )}

          {showErrorToast && (
            <Toast
              type="error"
              message={showSuccessToastMsg}
              onClose={() =>
                dispatchCashflow(
                  cashflowActions.setHideToasts()(dispatchCashflow)
                )
              }
            />
          )}
        </div>
      )}
    </>
  );
};

export default IncomeContainer;
