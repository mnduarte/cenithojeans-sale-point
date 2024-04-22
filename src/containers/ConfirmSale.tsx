import { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import { calculateTotalPercentage, formatCurrency } from "../utils/formatUtils";
import Spinner from "../components/Spinner";
import { FaMinus, FaPlus } from "react-icons/fa";
import { mappingConceptWithIcon } from "../utils/mappings";
import KeyboardNum from "../components/KeyboardNum";
import { Select } from "antd";
import { useTheme } from "../contexts/ThemeContext";

const ConfirmSale = ({
  employees,
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
  const [payment, setPayment] = useState({ cash: "", transfer: "" });
  const [
    percentageToDisccountOrAddPayment,
    setPercentageToDisccountOrAddPayment,
  ] = useState({ cash: 0, transfer: 0 });
  const [isWithPrepaid, setIsWithPrepaid] = useState(false);
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
    setPercentageToDisccountOrAddPayment({
      cash: 0,
      transfer: 0,
    });
    setPayment({ transfer: "", cash: "" });
    setIsWithPrepaid(false);
    setDevolutionModeActive(false);
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
    const mappingPayment = {
      cash: {
        operationDelete: (current: any) => {
          const amountCash = Number(String(current.cash).slice(0, -1));
          const amountTransfer = totalToPay - amountCash;

          return {
            transfer: isWithPrepaid ? current.transfer : amountTransfer,
            cash: amountCash,
          };
        },
        operationAdd: (current: any) => {
          const amountCash = Number(String(current.cash) + String(item.value));
          const amountTransfer = totalToPay - amountCash;

          return {
            transfer: isWithPrepaid ? current.transfer : amountTransfer,
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
            cash: isWithPrepaid ? current.cash : amountCash,
          };
        },
        operationAdd: (current: any) => {
          const amountTransfer = Number(
            String(current.transfer) + String(item.value)
          );
          const amountCash = totalToPay - amountTransfer;

          return {
            transfer: amountTransfer,
            cash: isWithPrepaid ? current.cash : amountCash,
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

  const totalCash = Number(payment.cash) + cashWithDisccount;

  const transferWithRecharge =
    multiplyByPercentageTranfer *
    Math.trunc(
      Number(payment.transfer) -
        Number(payment.transfer) *
          calculateTotalPercentage(
            Math.abs(percentageToDisccountOrAddPayment.transfer)
          )
    );

  const totalTransfer = Number(payment.transfer) + transferWithRecharge;

  const totalFinal = isWithPrepaid
    ? totalToPay + cashWithDisccount + transferWithRecharge
    : totalCash + totalTransfer;

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
    };
    onSale(data);
  };

  return (
    <>
      {isModalSaleOpen && (
        <div className="fixed inset-0 bg-[#252525] bg-opacity-60 flex items-center justify-center">
          {/* Contenido del modal */}
          <div
            className={`w-[75vh] p-8 rounded-md shadow-md relative ${themeStyles[theme].tailwindcss.modal}`}
          >
            {/* Icono de cerrar en la esquina superior derecha */}
            <button className="absolute top-4 right-4" onClick={closeModalSale}>
              <MdClose className="text-2xl" />
            </button>

            <h2 className="text-lg font-bold mb-4">Confirmar Venta</h2>

            <div className="mb-4 inline-block">
              <label className="mr-2 "> Vendedor (Local):</label>

              <Select
                value={typeSale === "local" ? sellerSelected : "-"}
                className={themeStyles[theme].classNameSelector}
                dropdownStyle={{
                  ...themeStyles[theme].dropdownStylesCustom,
                  width: 160,
                }}
                popupClassName={themeStyles[theme].classNameSelectorItem}
                style={{ width: 160 }}
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
              <label className="mx-2 "> (Pedido):</label>

              <Select
                value={typeSale === "pedido" ? sellerSelected : "-"}
                className={themeStyles[theme].classNameSelector}
                dropdownStyle={{
                  ...themeStyles[theme].dropdownStylesCustom,
                  width: 160,
                }}
                popupClassName={themeStyles[theme].classNameSelectorItem}
                style={{ width: 160 }}
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
            <br />

            <div className="mb-4 h-[5vh] flex items-center justify-start">
              {Boolean(lastNumOrder) && typeSale === "local" && (
                <>
                  <label className="mr-2">N° Orden:</label>
                  <input
                    type="text"
                    className={`w-[10vh] p-2 rounded-md mr-2 ${themeStyles[theme].tailwindcss.inputText}`}
                    readOnly
                    value={numOrder || lastNumOrder}
                    onFocus={() => setIsModalKeyboardNumOpen(true)}
                  />
                </>
              )}

              {typeSale === "pedido" && (
                <>
                  <label className="mr-2">N° Pedido:</label>

                  <input
                    type="text"
                    className={`w-[10vh] p-2 rounded-md mr-2 ${themeStyles[theme].tailwindcss.inputText}`}
                    readOnly
                    value={numOrder}
                    onFocus={() => setIsModalKeyboardNumOpen(true)}
                  />

                  <input
                    type="radio"
                    id="retiraLocalRadio"
                    name="tipoEnvio"
                    className="ml-4 mr-2 hover:cursor-pointer"
                    value="retiraLocal"
                    checked={typeShipment === "retiraLocal"}
                    onChange={(e) => {
                      setTypeShipment(e.target.value);
                    }}
                  />
                  <label
                    htmlFor="retiraLocalRadio"
                    className="select-none hover:cursor-pointer"
                  >
                    Retira local
                  </label>

                  <input
                    type="radio"
                    id="envioRadio"
                    name="tipoEnvio"
                    className="ml-4 mr-2 hover:cursor-pointer"
                    value="envio"
                    checked={typeShipment === "envio"}
                    onChange={(e) => {
                      setTypeShipment(e.target.value);
                    }}
                  />
                  <label
                    htmlFor="envioRadio"
                    className="select-none hover:cursor-pointer"
                  >
                    Envio
                  </label>
                </>
              )}
            </div>

            <div className="mb-4 select-none">
              <div className="mr-2">Prendas: {totalItems}</div>
              {Boolean(pricesWithconcepts.length) &&
                pricesWithconcepts.map((price: any) => (
                  <div className="mr-2" key={price.id}>
                    {mappingConceptWithIcon[price.concept].value}{" "}
                    <div className="inline-block">
                      {mappingConceptWithIcon[price.concept].icon}
                    </div>
                    : ${formatCurrency(price.price * price.quantity)}
                  </div>
                ))}
              <div className="mr-2 text-base font-bold">
                Total: ${formatCurrency(totalPrices)}
              </div>
              <br />
              {Boolean(totalDevolutionItems) && (
                <>
                  <div className="mr-2">
                    Devoluciones: {totalDevolutionItems}
                  </div>
                  <div className="mr-2 text-base font-bold">
                    Total: $
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
                  </div>
                </>
              )}
              {Boolean(pricesDevolutionWithconcepts.length) &&
                pricesDevolutionWithconcepts.map((price: any) => (
                  <div className="mr-2" key={price.id}>
                    {mappingConceptWithIcon[price.concept].value}{" "}
                    <div className="inline-block">
                      {mappingConceptWithIcon[price.concept].icon}
                    </div>
                    : ${formatCurrency(price.price * price.quantity)}
                  </div>
                ))}
              {Boolean(totalDevolutionPrices) && (
                <>
                  <div className="mr-2 text-base font-bold">
                    Total a descontar: ${formatCurrency(totalDevolutionPrices)}
                  </div>

                  <br />
                </>
              )}
              <div className="mr-2 text-base font-bold">
                Total a pagar: ${formatCurrency(totalToPay)}
              </div>

              {Boolean(typeSale === "pedido") && (
                <>
                  <div className="text-base font-bold flex items-center justify-end">
                    <input
                      type="checkbox"
                      checked={isWithPrepaid}
                      className="mr-2"
                      onClick={() => setIsWithPrepaid((current) => !current)}
                    />
                    <label
                      className="mr-2"
                      onClick={() => setIsWithPrepaid((current) => !current)}
                    >
                      Seña
                    </label>
                  </div>
                </>
              )}

              <div className="mt-2 h-[5vh] flex items-center justify-start">
                <label
                  onClick={() => {
                    setPercentageToDisccountOrAddPayment({
                      cash: 0,
                      transfer: 0,
                    });
                    setPayment({ transfer: "", cash: String(totalToPay) });
                  }}
                >
                  Efectivo:
                </label>

                <input
                  type="checkbox"
                  checked={
                    payment.transfer === "" &&
                    payment.cash === String(totalToPay)
                  }
                  onChange={() => {
                    setPercentageToDisccountOrAddPayment({
                      cash: 0,
                      transfer: 0,
                    });
                    setPayment({ transfer: "", cash: String(totalToPay) });
                  }}
                  className="ml-1 mr-2"
                />
                <input
                  type="text"
                  className={`w-[10vh] p-2 rounded-md ${themeStyles[theme].tailwindcss.inputText}`}
                  readOnly
                  value={payment.cash}
                  onFocus={() => setIsModalKeyboardCashOpen(true)}
                />
                <div
                  className={`text-center flex items-center justify-center `}
                >
                  <div className="w-12 h-12 pr-1 text-center flex items-center justify-center select-none">
                    {percentageToDisccountOrAddPayment.cash}%
                  </div>
                  <div className="w-10 h-12 flex flex-col">
                    <div
                      className="h-1/2 flex items-center justify-center hover:bg-gray-600 hover:text-white hover:cursor-pointer"
                      onClick={() =>
                        setPercentageToDisccountOrAddPayment((per: any) => ({
                          ...per,
                          cash: per.cash + 1,
                        }))
                      }
                    >
                      <FaPlus />
                    </div>
                    <div
                      className="h-1/2 flex items-center justify-center hover:bg-gray-600 hover:text-white hover:cursor-pointer"
                      onClick={() =>
                        setPercentageToDisccountOrAddPayment((per: any) => ({
                          ...per,
                          cash: per.cash - 1,
                        }))
                      }
                    >
                      <FaMinus />
                    </div>
                  </div>
                  ({cashWithDisccount})
                </div>
                <label
                  onClick={() => {
                    setPercentageToDisccountOrAddPayment({
                      cash: 0,
                      transfer: 0,
                    });
                    setPayment({ cash: "", transfer: String(totalToPay) });
                  }}
                  className="ml-10"
                >
                  Transfer:
                </label>

                <input
                  type="checkbox"
                  checked={
                    payment.cash === "" &&
                    payment.transfer === String(totalToPay)
                  }
                  onChange={() => {
                    setPercentageToDisccountOrAddPayment({
                      cash: 0,
                      transfer: 0,
                    });
                    setPayment({ cash: "", transfer: String(totalToPay) });
                  }}
                  className="ml-1 mr-2"
                />

                <input
                  type="text"
                  className={`w-[10vh] p-2 rounded-md ${themeStyles[theme].tailwindcss.inputText}`}
                  readOnly
                  value={payment.transfer}
                  onFocus={() => setIsModalKeyboardTransferOpen(true)}
                />
                <div className={`center flex items-center justify-center`}>
                  <div className="w-12 h-12 pr-1 text-center flex items-center justify-center select-none">
                    {percentageToDisccountOrAddPayment.transfer}%
                  </div>
                  <div className="w-10 h-12 flex flex-col">
                    <div
                      className="h-1/2 flex items-center justify-center hover:bg-gray-600 hover:text-white hover:cursor-pointer"
                      onClick={() =>
                        setPercentageToDisccountOrAddPayment((per: any) => ({
                          ...per,
                          transfer: per.transfer + 1,
                        }))
                      }
                    >
                      <FaPlus />
                    </div>
                    <div
                      className="h-1/2 flex items-center justify-center hover:bg-gray-600 hover:text-white hover:cursor-pointer"
                      onClick={() =>
                        setPercentageToDisccountOrAddPayment((per: any) => ({
                          ...per,
                          transfer: per.transfer - 1,
                        }))
                      }
                    >
                      <FaMinus />
                    </div>
                  </div>
                  ({transferWithRecharge})
                </div>
              </div>
              <div className="h-[10vh]">
                {percentageToDisccountOrAdd !== 0 && (
                  <>
                    <div className="mr-2 text-base">
                      {percentageToDisccountOrAdd > 0
                        ? "Gastos bancarios"
                        : "Descuentos"}
                      : ${formatCurrency(calculateTotalDiscount)}
                    </div>
                  </>
                )}

                <div className="mr-2 text-base">
                  {`${isWithPrepaid ? "Seña" : "Total"}`} en Efectivo: $
                  {formatCurrency(totalCash)}
                </div>
                <div className="mr-2 text-base">
                  {`${isWithPrepaid ? "Seña" : "Total"}`} en Transferencia: $
                  {formatCurrency(totalTransfer)}
                </div>
                <div className="mr-2 text-lg font-bold">
                  Total Final: ${formatCurrency(totalFinal)}
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <div
                className="w-1/2 bg-blue-500 hover:bg-blue-700 hover:cursor-pointer text-white px-4 py-2 rounded-md flex items-center justify-center mx-auto select-none"
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
              </div>
              <div
                className={`${
                  inboundSale
                    ? "bg-red-950"
                    : !availableAction
                    ? "bg-[#333333]"
                    : "bg-green-600 hover:bg-green-700 hover:cursor-pointer"
                } w-1/2 text-white px-4 py-2 rounded-md flex items-center justify-center mx-auto select-none`}
                onClick={() =>
                  !isLoading && availableAction && !inboundSale && handleSale()
                }
              >
                {inboundSale
                  ? "Venta ingresada"
                  : "Agregar al listado de ventas"}
                {isLoading && (
                  <div className="ml-2">
                    <Spinner />
                  </div>
                )}
              </div>
            </div>

            <div className="flex mt-4">
              <div
                className="w-full bg-red-500 hover:bg-red-800 hover:cursor-pointer text-white px-4 py-2 rounded-md flex items-center justify-center mx-auto select-none"
                onClick={onCleanAndClose}
              >
                Finalizar
              </div>
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
