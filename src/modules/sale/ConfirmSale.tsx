import { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import {
  calculateTotalPercentage,
  formatCurrency,
} from "../../utils/formatUtils";
import Spinner from "../../components/Spinner";
import { FaMinus, FaPlus } from "react-icons/fa";
import { mappingConceptWithIcon } from "../../utils/mappings";
import KeyboardNum from "../../components/KeyboardNum";
import { Select, Tag } from "antd";
import { useTheme } from "../../contexts/ThemeContext";

const ConfirmSale = ({
  employees,
  accountsForTransfer,
  isModalSaleOpen,
  setIsModalSaleOpen,
  totalItems,
  totalDevolutionItems,
  totalPrices,
  totalDevolutionPrices,
  onSale,
  isLoading,
  pricesSelected,
  devolutionPricesSelected,
  setPricesSelected,
  setDevolutionPricesSelected,
  inboundSale,
  handlePrintSale,
  setDevolutionModeActive,
  percentageToDisccountOrAdd,
  setPercentageToDisccountOrAdd,
  getLastNumOrder,
  lastNumOrder,
}: any) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();
  const [sellerSelected, setSellerSelected] = useState("");
  const [numOrder, setNumOrder] = useState(0);
  const [typeSale, setTypeSale] = useState("");
  const [typePayment, setTypePayment] = useState("");
  const [typeShipment, setTypeShipment] = useState("");
  const [accountForTransfer, setAccountForTransfer] = useState("");
  const [payment, setPayment] = useState({ cash: "", transfer: "" });
  const [
    percentageToDisccountOrAddPayment,
    setPercentageToDisccountOrAddPayment,
  ] = useState({ cash: 0, transfer: 0 });
  const [isWithPrepaid, setIsWithPrepaid] = useState(false);
  const [assignRechargeTranferToCash, setAssignRechargeTranferToCash] =
    useState(false);
  const [isModalKeyboardNumOpen, setIsModalKeyboardNumOpen] = useState(false);
  const [isModalKeyboardCashOpen, setIsModalKeyboardCashOpen] = useState(false);
  const [isModalKeyboardTransferOpen, setIsModalKeyboardTransferOpen] =
    useState(false);

  const availableAction =
    Boolean(sellerSelected.length) &&
    ((typeSale === "pedido" && Boolean(typeShipment.length)) ||
      typeSale === "local");

  const closeModalSale = () => {
    setSellerSelected("");
    setNumOrder(0);
    setPercentageToDisccountOrAdd(0);
    setTypeSale("");
    setTypePayment("");
    setTypeShipment("");
    setAccountForTransfer("");
    setPercentageToDisccountOrAddPayment({
      cash: 0,
      transfer: 0,
    });
    setPayment({ transfer: "", cash: "" });
    setIsWithPrepaid(false);
    setDevolutionModeActive(false);
    setAssignRechargeTranferToCash(false);
    setIsModalSaleOpen(false);
  };

  const pricesWithconcepts = pricesSelected.filter((price: any) =>
    Boolean(price.concept)
  );

  const pricesDevolutionWithconcepts = devolutionPricesSelected.filter(
    (price: any) => Boolean(price.concept)
  );

  const onCleanAndClose = () => {
    setPricesSelected([]);
    setDevolutionPricesSelected([]);
    closeModalSale();
  };

  const handleManualNumOrder = (item: any) => {
    if (item.action === "deleteLast") {
      return setNumOrder((currentValue: any) =>
        Number(String(currentValue).slice(0, -1))
      );
    }

    if (item.action === "addPrice") {
      return setIsModalKeyboardNumOpen(false);
    }

    setNumOrder((currentValue: any) =>
      Number(String(currentValue) + String(item.value))
    );
  };

  const handleManualPayment = (item: any, typePay: any) => {
    const mappingPayment: any = {
      cash: {
        operationDelete: (current: any) => {
          const amountCash = Number(String(current.cash).slice(0, -1));
          const amountTransfer = totalToPay - amountCash;

          return {
            transfer: amountTransfer,
            cash: amountCash,
          };
        },
        operationAdd: (current: any) => {
          const amountCash = Number(String(current.cash) + String(item.value));
          const amountTransfer = totalToPay - amountCash;

          return {
            transfer: amountTransfer,
            cash: amountCash,
          };
        },
      },
      transfer: {
        operationDelete: (current: any) => {
          const amountTransfer = Number(String(current.transfer).slice(0, -1));
          const amountCash = totalToPay - amountTransfer;

          return {
            transfer: amountTransfer,
            cash: amountCash,
          };
        },
        operationAdd: (current: any) => {
          const amountTransfer = Number(
            String(current.transfer) + String(item.value)
          );
          const amountCash = totalToPay - amountTransfer;

          return {
            transfer: amountTransfer,
            cash: amountCash,
          };
        },
      },
    };

    if (item.action === "deleteLast") {
      return setPayment((current: any) =>
        mappingPayment[typePay].operationDelete(current)
      );
    }

    if (item.action === "addPrice") {
      return typePay === "cash"
        ? setIsModalKeyboardCashOpen(false)
        : setIsModalKeyboardTransferOpen(false);
    }

    setPayment((current: any) => mappingPayment[typePay].operationAdd(current));
  };

  const multiplyBy = percentageToDisccountOrAdd < 0 ? 1 : -1;
  const multiplyByPercentageCash =
    percentageToDisccountOrAddPayment.cash < 0 ? 1 : -1;
  const multiplyByPercentageTranfer =
    percentageToDisccountOrAddPayment.transfer < 0 ? 1 : -1;
  const totalToPay = totalPrices - (totalDevolutionPrices || 0);
  const calculateTotalDiscount =
    multiplyBy *
    (totalToPay -
      totalToPay *
        calculateTotalPercentage(Math.abs(percentageToDisccountOrAdd)));

  useEffect(() => {
    if (typeSale === "local" && sellerSelected) {
      getLastNumOrder(sellerSelected);
    }
  }, [typeSale, sellerSelected]);

  const cashWithDisccount =
    multiplyByPercentageCash *
    Math.trunc(
      Number(payment.cash) -
        Number(payment.cash) *
          calculateTotalPercentage(
            Math.abs(percentageToDisccountOrAddPayment.cash)
          )
    );

  const transferWithRecharge =
    multiplyByPercentageTranfer *
    Math.trunc(
      Number(payment.transfer) -
        Number(payment.transfer) *
          calculateTotalPercentage(
            Math.abs(percentageToDisccountOrAddPayment.transfer)
          )
    );

  const totalCash =
    Number(payment.cash) +
    cashWithDisccount +
    Number(assignRechargeTranferToCash ? transferWithRecharge : 0);

  const totalTransfer =
    Number(payment.transfer) +
    transferWithRecharge -
    Number(assignRechargeTranferToCash ? transferWithRecharge : 0);

  const totalFinal = totalCash + totalTransfer;

  const handleSale = () => {
    const [objEmployee] = employees.filter(
      (employee: any) => employee.name === sellerSelected
    );

    const data = {
      employee: sellerSelected,
      store: objEmployee.store,
      typeSale,
      typePayment,
      numOrder: numOrder || (typeSale === "local" ? lastNumOrder : 0),
      typeShipment,
      percentageCash: percentageToDisccountOrAddPayment.cash,
      percentageTransfer: percentageToDisccountOrAddPayment.transfer,
      cashWithDisccount,
      transferWithRecharge,
      totalCash,
      totalTransfer,
      totalToPay,
      totalFinal,
      isWithPrepaid,
      accountForTransfer: Boolean(payment.transfer) ? accountForTransfer : "",
    };
    onSale(data);
  };

  useEffect(() => {
    if (accountForTransfer === "" && accountsForTransfer.length > 0) {
      setAccountForTransfer(accountsForTransfer[0].name);
    }
  }, [accountsForTransfer]);

  return (
    <>
      {isModalSaleOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`w-[78vh] rounded-lg shadow-xl relative ${themeStyles[theme].tailwindcss.modal}`}
            style={{ border: "1px solid #3f3f46" }}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-100">
                  Confirmar Venta
                </h2>
                {typeSale === "local" && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-lime-600/20 text-lime-400 rounded border border-lime-600/30">
                    Local
                  </span>
                )}
                {typeSale === "pedido" && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-orange-600/20 text-orange-400 rounded border border-orange-600/30">
                    Pedido
                  </span>
                )}
              </div>
              <button
                className="text-gray-400 hover:text-gray-200 p-1 rounded transition-colors"
                onClick={closeModalSale}
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3">
              {/* Vendedor Section */}
              <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/50">
                <label className="block text-xs text-gray-400 mb-2">
                  Seleccionar Vendedor
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">
                      Local
                    </label>
                    <Select
                      value={typeSale === "local" ? sellerSelected : "-"}
                      className={themeStyles[theme].classNameSelector}
                      dropdownStyle={{
                        ...themeStyles[theme].dropdownStylesCustom,
                        width: 160,
                      }}
                      popupClassName={themeStyles[theme].classNameSelectorItem}
                      style={{ width: "100%" }}
                      onSelect={(value: any) => {
                        setPercentageToDisccountOrAdd(0);
                        setSellerSelected(value);
                        setNumOrder(0);
                        setPayment({ transfer: "", cash: String(totalToPay) });
                        setTypeSale("local");
                      }}
                      options={employees.map((data: any) => ({
                        value: data.name,
                        label: data.name,
                      }))}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">
                      Pedido
                    </label>
                    <Select
                      value={typeSale === "pedido" ? sellerSelected : "-"}
                      className={themeStyles[theme].classNameSelector}
                      dropdownStyle={{
                        ...themeStyles[theme].dropdownStylesCustom,
                        width: 160,
                      }}
                      popupClassName={themeStyles[theme].classNameSelectorItem}
                      style={{ width: "100%" }}
                      onSelect={(value: any) => {
                        setPercentageToDisccountOrAdd(0);
                        setSellerSelected(value);
                        setNumOrder(0);
                        setPayment({ transfer: "", cash: String(totalToPay) });
                        setTypeSale("pedido");
                        setTypeShipment("retiraLocal");
                      }}
                      options={employees.map((data: any) => ({
                        value: data.name,
                        label: data.name,
                      }))}
                    />
                  </div>
                </div>

                {/* Número de Orden/Pedido */}
                <div className="mt-4 flex items-center gap-4">
                  {Boolean(lastNumOrder) && typeSale === "local" && (
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        N° Orden
                      </label>
                      <input
                        type="text"
                        className={`w-24 p-2 rounded-md text-center ${themeStyles[theme].tailwindcss.inputText}`}
                        readOnly
                        value={numOrder || lastNumOrder}
                        onFocus={() => setIsModalKeyboardNumOpen(true)}
                      />
                    </div>
                  )}

                  {typeSale === "pedido" && (
                    <>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          N° Pedido
                        </label>
                        <input
                          type="text"
                          className={`w-24 p-2 rounded-md text-center ${themeStyles[theme].tailwindcss.inputText}`}
                          readOnly
                          value={numOrder}
                          onFocus={() => setIsModalKeyboardNumOpen(true)}
                        />
                      </div>
                      <div className="flex items-end gap-4 pb-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="tipoEnvio"
                            className="accent-blue-500"
                            value="retiraLocal"
                            checked={typeShipment === "retiraLocal"}
                            onChange={(e) => setTypeShipment(e.target.value)}
                          />
                          <span className="text-sm text-gray-300">
                            Retira local
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="tipoEnvio"
                            className="accent-blue-500"
                            value="envio"
                            checked={typeShipment === "envio"}
                            onChange={(e) => setTypeShipment(e.target.value)}
                          />
                          <span className="text-sm text-gray-300">Envío</span>
                        </label>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Resumen de Venta */}
              <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/50">
                <label className="block text-xs text-gray-400 mb-2">
                  Resumen
                </label>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Prendas:</span>
                    <span>{totalItems}</span>
                  </div>

                  {Boolean(pricesWithconcepts.length) &&
                    pricesWithconcepts.map((price: any) => (
                      <div
                        className="flex justify-between text-gray-400"
                        key={price.id}
                      >
                        <span className="flex items-center gap-2">
                          {mappingConceptWithIcon[price.concept].value}
                          <span className="text-base">
                            {mappingConceptWithIcon[price.concept].icon}
                          </span>
                        </span>
                        <span>
                          ${formatCurrency(price.price * price.quantity)}
                        </span>
                      </div>
                    ))}

                  <div className="flex justify-between text-gray-100 font-semibold pt-1">
                    <span>Total:</span>
                    <span>${formatCurrency(totalPrices)}</span>
                  </div>

                  {Boolean(totalDevolutionItems) && (
                    <>
                      <div className="border-t border-gray-700 my-2"></div>
                      <div className="flex justify-between text-red-400">
                        <span>Devoluciones:</span>
                        <span>{totalDevolutionItems}</span>
                      </div>
                      <div className="flex justify-between text-red-400">
                        <span>Total devoluciones:</span>
                        <span>
                          $
                          {formatCurrency(
                            devolutionPricesSelected.reduce(
                              (acc: any, current: any) =>
                                Number(acc) +
                                (!Boolean(current.concept)
                                  ? current.price * current.quantity
                                  : 0),
                              0
                            )
                          )}
                        </span>
                      </div>
                    </>
                  )}

                  {Boolean(pricesDevolutionWithconcepts.length) &&
                    pricesDevolutionWithconcepts.map((price: any) => (
                      <div
                        className="flex justify-between text-gray-400"
                        key={price.id}
                      >
                        <span className="flex items-center gap-2">
                          {mappingConceptWithIcon[price.concept].value}
                          <span className="text-base">
                            {mappingConceptWithIcon[price.concept].icon}
                          </span>
                        </span>
                        <span>
                          ${formatCurrency(price.price * price.quantity)}
                        </span>
                      </div>
                    ))}

                  {Boolean(totalDevolutionPrices) && (
                    <div className="flex justify-between text-red-400 font-semibold">
                      <span>Total a descontar:</span>
                      <span>${formatCurrency(totalDevolutionPrices)}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-700 my-2"></div>
                  <div className="flex justify-between text-lg text-white font-bold">
                    <span>Total a pagar:</span>
                    <span>${formatCurrency(totalToPay)}</span>
                  </div>
                </div>

                {Boolean(typeSale === "pedido") && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isWithPrepaid}
                        className="accent-blue-500"
                        onChange={() => setIsWithPrepaid((current) => !current)}
                      />
                      <span className="text-sm text-gray-300">Seña</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Método de Pago */}
              <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/50">
                <label className="block text-xs text-gray-400 mb-2">
                  Método de Pago
                </label>

                {/* Efectivo y Transferencia en misma línea */}
                <div className="flex items-center gap-6">
                  {/* Efectivo */}
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={
                          payment.transfer === "" &&
                          payment.cash === String(totalToPay)
                        }
                        className="accent-green-500"
                        onChange={() => {
                          setPercentageToDisccountOrAddPayment({
                            cash: 0,
                            transfer: 0,
                          });
                          setPayment({
                            transfer: "",
                            cash: String(totalToPay),
                          });
                        }}
                      />
                      <span className="text-xs text-gray-300">Efectivo</span>
                    </label>
                    <input
                      type="text"
                      className={`w-24 p-1.5 rounded text-center text-sm ${themeStyles[theme].tailwindcss.inputText}`}
                      readOnly
                      value={payment.cash}
                      onFocus={() => setIsModalKeyboardCashOpen(true)}
                    />
                    <div className="flex items-center gap-0.5">
                      <span className="text-xs text-gray-400 w-8 text-right">
                        {percentageToDisccountOrAddPayment.cash}%
                      </span>
                      <div className="flex flex-col">
                        <button
                          className="p-0.5 hover:bg-gray-600 rounded transition-colors"
                          onClick={() =>
                            setPercentageToDisccountOrAddPayment(
                              (per: any) => ({
                                ...per,
                                cash: per.cash + 1,
                              })
                            )
                          }
                        >
                          <FaPlus className="text-[10px] text-gray-400" />
                        </button>
                        <button
                          className="p-0.5 hover:bg-gray-600 rounded transition-colors"
                          onClick={() =>
                            setPercentageToDisccountOrAddPayment(
                              (per: any) => ({
                                ...per,
                                cash: per.cash - 1,
                              })
                            )
                          }
                        >
                          <FaMinus className="text-[10px] text-gray-400" />
                        </button>
                      </div>
                      <span className="text-xs text-gray-500">
                        ({cashWithDisccount})
                      </span>
                    </div>
                  </div>

                  {/* Transferencia */}
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={
                          payment.cash === "" &&
                          payment.transfer === String(totalToPay)
                        }
                        className="accent-blue-500"
                        onChange={() => {
                          setPercentageToDisccountOrAddPayment({
                            cash: 0,
                            transfer: 0,
                          });
                          setPayment({
                            cash: "",
                            transfer: String(totalToPay),
                          });
                        }}
                      />
                      <span className="text-xs text-gray-300">Transfer</span>
                    </label>
                    <input
                      type="text"
                      className={`w-24 p-1.5 rounded text-center text-sm ${themeStyles[theme].tailwindcss.inputText}`}
                      readOnly
                      value={payment.transfer}
                      onFocus={() => setIsModalKeyboardTransferOpen(true)}
                    />
                    <div className="flex items-center gap-0.5">
                      <span className="text-xs text-gray-400 w-8 text-right">
                        {percentageToDisccountOrAddPayment.transfer}%
                      </span>
                      <div className="flex flex-col">
                        <button
                          className="p-0.5 hover:bg-gray-600 rounded transition-colors"
                          onClick={() =>
                            setPercentageToDisccountOrAddPayment(
                              (per: any) => ({
                                ...per,
                                transfer: per.transfer + 1,
                              })
                            )
                          }
                        >
                          <FaPlus className="text-[10px] text-gray-400" />
                        </button>
                        <button
                          className="p-0.5 hover:bg-gray-600 rounded transition-colors"
                          onClick={() =>
                            setPercentageToDisccountOrAddPayment(
                              (per: any) => ({
                                ...per,
                                transfer: per.transfer - 1,
                              })
                            )
                          }
                        >
                          <FaMinus className="text-[10px] text-gray-400" />
                        </button>
                      </div>
                      <span className="text-xs text-gray-500">
                        ({transferWithRecharge})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cuenta de transferencia */}
                {Boolean(payment.transfer) && (
                  <div className="mt-3 pt-3 border-t border-gray-700 flex items-center gap-3">
                    <label className="text-sm text-gray-400">Cuenta:</label>
                    <Select
                      value={accountForTransfer}
                      className={themeStyles[theme].classNameSelector}
                      dropdownStyle={{
                        ...themeStyles[theme].dropdownStylesCustom,
                        width: 160,
                      }}
                      popupClassName={themeStyles[theme].classNameSelectorItem}
                      style={{ width: 160 }}
                      onSelect={(value: any) => setAccountForTransfer(value)}
                      options={accountsForTransfer.map((data: any) => ({
                        value: data.name,
                        label: data.name,
                      }))}
                    />
                  </div>
                )}

                {/* Gastos bancarios */}
                {Boolean(transferWithRecharge) && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        Gastos bancarios: $
                        {formatCurrency(transferWithRecharge)}
                      </span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={assignRechargeTranferToCash}
                          className="accent-blue-500"
                          onChange={() =>
                            setAssignRechargeTranferToCash(
                              (current) => !current
                            )
                          }
                        />
                        <span className="text-xs text-gray-400">
                          Asignar a Efectivo
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {percentageToDisccountOrAdd !== 0 && (
                  <div className="mt-2 text-sm text-gray-400">
                    {percentageToDisccountOrAdd > 0
                      ? "Gastos bancarios"
                      : "Descuentos"}
                    : ${formatCurrency(calculateTotalDiscount)}
                  </div>
                )}
              </div>

              {/* Totales Finales */}
              <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>{isWithPrepaid ? "Seña" : "Total"} en Efectivo:</span>
                    <span>${formatCurrency(totalCash)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>
                      {isWithPrepaid ? "Seña" : "Total"} en Transferencia:
                    </span>
                    <span>${formatCurrency(totalTransfer)}</span>
                  </div>
                  <div className="flex justify-between text-lg text-white font-bold pt-2 border-t border-blue-800/30">
                    <span>Total Final:</span>
                    <span>${formatCurrency(totalFinal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-700 space-y-2">
              <div className="flex gap-3">
                <button
                  className="flex-1 py-2.5 px-4 rounded-md text-sm font-medium bg-transparent border border-blue-600 text-blue-400 hover:bg-blue-600/10 transition-colors"
                  onClick={() =>
                    handlePrintSale({
                      sellerSelected,
                      typeSale,
                      numOrder,
                      pricesWithconcepts,
                      pricesDevolutionWithconcepts,
                      percentageCash: percentageToDisccountOrAddPayment.cash,
                      percentageTransfer:
                        percentageToDisccountOrAddPayment.transfer,
                      cashWithDisccount,
                      transferWithRecharge,
                      totalCash,
                      totalTransfer,
                      totalToPay,
                      totalFinal,
                    })
                  }
                >
                  Imprimir Ticket
                </button>
                <button
                  className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    inboundSale
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : !availableAction
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                  onClick={() =>
                    !isLoading &&
                    availableAction &&
                    !inboundSale &&
                    handleSale()
                  }
                  disabled={inboundSale || !availableAction}
                >
                  {isLoading ? (
                    <Spinner />
                  ) : inboundSale ? (
                    "Venta ingresada"
                  ) : (
                    "Agregar al listado"
                  )}
                </button>
              </div>
              <button
                className="w-full py-2.5 px-4 rounded-md text-sm font-medium bg-transparent border border-rose-600 text-rose-400 hover:bg-rose-600/10 transition-colors"
                onClick={onCleanAndClose}
              >
                Finalizar
              </button>
            </div>
          </div>

          <KeyboardNum
            isModalKeyboardNumOpen={isModalKeyboardNumOpen}
            manualNum={numOrder}
            handleManualNum={handleManualNumOrder}
            closeModal={() => setIsModalKeyboardNumOpen(false)}
            title={`Ingrese N° ${typeSale === "local" ? "Orden" : "Pedido"}`}
          />
          <KeyboardNum
            isModalKeyboardNumOpen={isModalKeyboardCashOpen}
            manualNum={payment.cash}
            handleManualNum={(item: any) => handleManualPayment(item, "cash")}
            closeModal={() => setIsModalKeyboardCashOpen(false)}
            title={`Ingrese monto Efectivo`}
          />
          <KeyboardNum
            isModalKeyboardNumOpen={isModalKeyboardTransferOpen}
            manualNum={payment.transfer}
            handleManualNum={(item: any) =>
              handleManualPayment(item, "transfer")
            }
            closeModal={() => setIsModalKeyboardTransferOpen(false)}
            title={`Ingrese monto Transferencia`}
          />
        </div>
      )}
    </>
  );
};

export default ConfirmSale;
