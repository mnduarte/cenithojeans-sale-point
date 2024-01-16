import { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import KeyboardNum from "../components/KeyboardNum";
import { useEmployee } from "../contexts/EmployeeContext";
import { cashflowActions, useCashflow } from "../contexts/CashflowContext";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";
import Keyboard from "../components/Keyboard";

const OutgoingContainer = ({
  isModalOutgoingOpen,
  setIsModalOutgoingOpen,
}: any) => {
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

  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [isModalKeyboardNumOpen, setIsModalKeyboardNumOpen] = useState(false);

  const closeModal = () => {
    setDescription("");
    setAmount(0);
    setIsModalOutgoingOpen(false);
  };

  const handleIncome = () => {
    const data = {
      type: "egreso",
      description,
      amount,
    };

    dispatchCashflow(cashflowActions.addCashflow(data)(dispatchCashflow));
    setDescription("");
    setAmount(0);
  };

  const handleManualNumOrder = (item: any) => {
    if (item.action === "deleteLast") {
      return setAmount((currentValue: any) =>
        Number(String(currentValue).slice(0, -1))
      );
    }

    if (item.action === "addPrice") {
      return setIsModalKeyboardNumOpen(false);
    }

    setAmount((currentValue: any) =>
      Number(String(currentValue) + String(item.value))
    );
  };

  return (
    <>
      {isModalOutgoingOpen && (
        <div className="fixed inset-0 bg-[#252525] bg-opacity-60 flex items-center justify-center">
          {/* Contenido del modal */}
          <div className="w-[60vh] bg-gray-800 border border-[#000000] p-8 rounded shadow-md relative">
            {/* Icono de cerrar en la esquina superior derecha */}
            <button
              className="absolute top-4 right-4 text-white"
              onClick={closeModal}
            >
              <MdClose className="text-2xl" />
            </button>

            <h2 className="text-white text-lg font-bold mb-4">
              Agregar Egreso
            </h2>

            <div className="mb-4 h-[5vh] flex items-center justify-start">
              <label className="mr-2 text-white">Agrege importe:</label>

              <input
                type="text"
                className="w-[10vh] p-2 border border-[#484E55] rounded-md mr-2"
                readOnly
                value={amount}
                onFocus={() => setIsModalKeyboardNumOpen(true)}
              />
            </div>

            <div className="mb-4">
              <label className="mb-4 h-[5vh] flex items-center justify-start">
                Descripcion:
              </label>
              <input
                type="text"
                value={description}
                readOnly
                className="w-[30vh] p-2 border border-[#484E55] rounded-md mr-2"
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
                className={`bg-green-800 hover:bg-green-800 hover:cursor-pointer w-1/2 text-white px-4 py-2 rounded-md flex items-center justify-center mx-auto select-none ${
                  (!Boolean(description.length) || !Boolean(amount)) &&
                  "bg-gray-500"
                }`}
                onClick={() =>
                  Boolean(description.length) &&
                  Boolean(amount) &&
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
            manualNum={amount}
            handleManualNum={handleManualNumOrder}
            closeModal={() => setIsModalKeyboardNumOpen(false)}
            title="Ingrese Monto"
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

export default OutgoingContainer;
