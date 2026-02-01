import { useState } from "react";
import { MdClose } from "react-icons/md";
import KeyboardNum from "../../components/KeyboardNum";
import { cashflowActions, useCashflow } from "../../contexts/CashflowContext";
import { useCashier } from "../../contexts/CashierContext";
import Spinner from "../../components/Spinner";
import Toast from "../../components/Toast";
import Keyboard from "../../components/Keyboard";
import { useUser } from "../../contexts/UserContext";
import { useTheme } from "../../contexts/ThemeContext";
import { formatDateToYYYYMMDD } from "../../utils/formatUtils";
import { DatePicker } from "antd";
import { dateFormat } from "../../utils/constants";
import dayjs from "dayjs";

const OutgoingContainer = ({
  isModalOutgoingOpen,
  setIsModalOutgoingOpen,
}: any) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();
  const {
    state: { user },
  } = useUser();
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

  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [isModalKeyboardNumOpen, setIsModalKeyboardNumOpen] = useState(false);
  const [typePayment, setTypePayment] = useState<any>("cash");
  const [date, setDate] = useState<any>(formatDateToYYYYMMDD(new Date()));

  const closeModal = () => {
    setDescription("");
    setAmount(0);
    setIsModalOutgoingOpen(false);
  };

  const handleOutgoing = () => {
    const data = {
      type: "egreso",
      description,
      store: user.store === "ALL" ? "BOGOTA" : user.store,
      typePayment,
      date,
      amount,
      cashierId: selectedCashier?.id || null,
      cashierName: selectedCashier?.name || null,
    };

    dispatchCashflow(cashflowActions.addCashflow(data)(dispatchCashflow));
    setDescription("");
    setAmount(0);
    setDate(formatDateToYYYYMMDD(new Date()));
    setTypePayment("cash");
  };

  const handleManualNum = (item: any) => {
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

  const isFormValid = Boolean(description.length) && Boolean(amount);

  return (
    <>
      {isModalOutgoingOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`w-[62vh] rounded-lg shadow-xl relative ${themeStyles[theme].tailwindcss.modal}`}
            style={{ border: "1px solid #3f3f46" }}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-rose-500 rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-100">Agregar Egreso</h2>
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
              {/* Importe y Fecha */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Importe</label>
                  <input
                    type="text"
                    className={`w-full p-2.5 rounded-md text-center font-medium ${themeStyles[theme].tailwindcss.inputText}`}
                    readOnly
                    value={amount}
                    onFocus={() => setIsModalKeyboardNumOpen(true)}
                    placeholder="$0"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Fecha</label>
                  <DatePicker
                    onChange={(date: any) => setDate(date.format("YYYY-MM-DD"))}
                    className={`${themeStyles[theme].datePickerIndicator}`}
                    style={{ ...themeStyles[theme].datePicker, width: "100%" }}
                    popupClassName={themeStyles[theme].classNameDatePicker}
                    allowClear={false}
                    format={dateFormat}
                    value={dayjs(date)}
                  />
                </div>
              </div>

              {/* Tipo de Pago */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tipo de Pago</label>
                <div className="flex gap-3">
                  <button
                    className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all border ${
                      typePayment === "cash"
                        ? "bg-gray-600 border-gray-500 text-white"
                        : "bg-transparent border-gray-600 text-gray-400 hover:border-gray-500"
                    }`}
                    onClick={() => setTypePayment("cash")}
                  >
                    Efectivo
                  </button>
                  <button
                    className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all border ${
                      typePayment === "transfer"
                        ? "bg-gray-600 border-gray-500 text-white"
                        : "bg-transparent border-gray-600 text-gray-400 hover:border-gray-500"
                    }`}
                    onClick={() => setTypePayment("transfer")}
                  >
                    Transferencia
                  </button>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Descripción *</label>
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
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
                onClick={() => isFormValid && handleOutgoing()}
                disabled={!isFormValid}
              >
                {loadingCashflow ? <Spinner /> : "Guardar"}
              </button>
            </div>
          </div>

          <KeyboardNum
            isModalKeyboardNumOpen={isModalKeyboardNumOpen}
            manualNum={amount}
            handleManualNum={handleManualNum}
            closeModal={() => setIsModalKeyboardNumOpen(false)}
            title="Ingrese Monto"
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

export default OutgoingContainer;
