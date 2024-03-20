import { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import { calculateTotalPercentage, formatCurrency } from "../utils/formatUtils";
import Spinner from "../components/Spinner";
import { FaMinus, FaPlus } from "react-icons/fa";
import { mappingConceptWithIcon } from "../utils/mappings";
import KeyboardNum from "../components/KeyboardNum";

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
  const [sellerSelected, setSellerSelected] = useState("");
  const [numOrder, setNumOrder] = useState(0);
  const [typeSale, setTypeSale] = useState("");
  const [typePayment, setTypePayment] = useState("");
  const [typeShipment, setTypeShipment] = useState("");
  const [isModalKeyboardNumOpen, setIsModalKeyboardNumOpen] = useState(false);

  const availableAction =
    Boolean(sellerSelected.length) &&
    ((typeSale === "pedido" && Boolean(typePayment.length)) ||
      typeSale === "local");

  const closeModalSale = () => {
    setSellerSelected("");
    setNumOrder(0);
    setPercentageToDisccountOrAdd(0);
    setTypeSale("");
    setTypePayment("");
    setTypeShipment("");
    setDevolutionModeActive(false);
    setIsModalSaleOpen(false);
  };

  const pricesWithconcepts = pricesSelected.filter((price: any) =>
    Boolean(price.concept)
  );

  const pricesDevolutionWithconcepts = devolutionPricesSelected.filter(
    (price: any) => Boolean(price.concept)
  );

  const handleSale = () => {
    const [objEmployee] = employees.filter(
      (employee: any) => employee.name === sellerSelected
    );

    const data = {
      employee: sellerSelected,
      store: objEmployee.store,
      typeSale,
      typePayment,
      numOrder,
      typeShipment,
    };
    onSale(data);
  };

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

  const multiplyBy = percentageToDisccountOrAdd < 0 ? 1 : -1;
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

  return (
    <>
      {isModalSaleOpen && (
        <div className="fixed inset-0 bg-[#252525] bg-opacity-60 flex items-center justify-center">
          {/* Contenido del modal */}
          <div className="w-[65vh] bg-gray-800 border border-[#000000] p-8 rounded shadow-md relative">
            {/* Icono de cerrar en la esquina superior derecha */}
            <button
              className="absolute top-4 right-4 text-white"
              onClick={closeModalSale}
            >
              <MdClose className="text-2xl" />
            </button>

            <h2 className="text-white text-lg font-bold mb-4">
              Confirmar Venta
            </h2>

            <div className="mb-4 inline-block">
              <label className="mr-2 text-white">Seleccione Vendedor:</label>
              <select
                className="p-2 border border-[#484E55] rounded-md"
                onChange={(e) => setSellerSelected(e.target.value)}
                defaultValue=""
              >
                <option value="" className="py-2" disabled hidden>
                  -
                </option>
                {employees.map((employee: any) => (
                  <option
                    value={employee.name}
                    key={employee.id}
                    className="py-2"
                  >
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
            <br />

            <div className="mb-4 inline-block">
              <label className="mr-2 text-white">Tipo de venta:</label>
              <select
                className="p-2 border border-[#484E55] rounded-md"
                onChange={(e) => {
                  setPercentageToDisccountOrAdd(0);
                  setTypePayment("efectivo");
                  setTypeSale(e.target.value);
                }}
                defaultValue=""
              >
                <option value="" className="py-2" disabled hidden>
                  -
                </option>
                <option value="local" className="py-2">
                  Local
                </option>
                <option value="pedido" className="py-2">
                  Pedido
                </option>
              </select>
              {Boolean(lastNumOrder) && typeSale === "local" && (
                <label className="ml-2">N° Orden: {lastNumOrder}</label>
              )}
            </div>

            <div className="mb-4 h-[5vh] flex items-center justify-start">
              {typeSale === "pedido" && (
                <>
                  <label className="mr-2 text-white">Num de Pedido:</label>

                  <input
                    type="text"
                    className="w-[10vh] p-2 border border-[#484E55] rounded-md mr-2"
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
                    onChange={(e) => {
                      setTypeShipment(e.target.value);
                    }}
                  />
                  <label
                    htmlFor="retiraLocalRadio"
                    className="text-white select-none hover:cursor-pointer"
                  >
                    Retira local
                  </label>

                  <input
                    type="radio"
                    id="envioRadio"
                    name="tipoEnvio"
                    className="ml-4 mr-2 hover:cursor-pointer"
                    value="envio"
                    onChange={(e) => {
                      setTypeShipment(e.target.value);
                    }}
                  />
                  <label
                    htmlFor="envioRadio"
                    className="text-white select-none hover:cursor-pointer"
                  >
                    Envio
                  </label>
                </>
              )}
            </div>

            <div className="mb-4 h-[5vh] flex items-center justify-start">
              {typeSale && (
                <>
                  <input
                    type="radio"
                    id="efectivoRadio"
                    name="tipoPago"
                    className="ml-4 mr-2 hover:cursor-pointer"
                    checked={typeSale === "local" || typePayment === "efectivo"}
                    value="efectivo"
                    onChange={(e) => {
                      setPercentageToDisccountOrAdd(0);
                      setTypePayment(e.target.value);
                    }}
                  />
                  <label
                    htmlFor="efectivoRadio"
                    className="text-white select-none hover:cursor-pointer"
                  >
                    Efectivo
                  </label>

                  {typeSale === "pedido" && (
                    <>
                      <input
                        type="radio"
                        id="transferenciaRadio"
                        name="tipoPago"
                        className="ml-4 mr-2 hover:cursor-pointer"
                        value="transferencia"
                        onChange={(e) => {
                          setPercentageToDisccountOrAdd(0);
                          setTypePayment(e.target.value);
                        }}
                      />
                      <label
                        htmlFor="transferenciaRadio"
                        className="text-white select-none hover:cursor-pointer"
                      >
                        Transferencia
                      </label>
                    </>
                  )}

                  <div
                    className={`w-20 text-white text-center flex items-center justify-center ml-2 `}
                  >
                    <div className="w-12 h-12 pr-1 border border-[#484E55] text-white text-center flex items-center justify-center select-none">
                      {percentageToDisccountOrAdd}%
                    </div>

                    <div className="w-10 h-12 flex flex-col">
                      <div
                        className="h-1/2 flex items-center justify-center border border-[#484E55] hover:bg-[#484E55] hover:cursor-pointer"
                        onClick={() =>
                          Boolean(typePayment) &&
                          setPercentageToDisccountOrAdd((per: any) => per + 1)
                        }
                      >
                        <FaPlus />
                      </div>
                      <div
                        className="h-1/2 flex items-center justify-center border border-[#484E55] hover:bg-[#484E55] hover:cursor-pointer"
                        onClick={() =>
                          Boolean(typePayment) &&
                          setPercentageToDisccountOrAdd((per: any) => per - 1)
                        }
                      >
                        <FaMinus />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mb-4 select-none">
              <div className="mr-2 text-white">Prendas: {totalItems}</div>
              {Boolean(pricesWithconcepts.length) &&
                pricesWithconcepts.map((price: any) => (
                  <div className="mr-2 text-white" key={price.id}>
                    {mappingConceptWithIcon[price.concept].value}{" "}
                    <div className="inline-block">
                      {mappingConceptWithIcon[price.concept].icon}
                    </div>
                    : ${formatCurrency(price.price * price.quantity)}
                  </div>
                ))}
              <div className="mr-2 text-white text-base font-bold">
                Total: ${formatCurrency(totalPrices)}
              </div>
              <br />
              {Boolean(totalDevolutionItems) && (
                <>
                  <div className="mr-2 text-white">
                    Devoluciones: {totalDevolutionItems}
                  </div>
                  <div className="mr-2 text-white text-base font-bold">
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
                  <div className="mr-2 text-white" key={price.id}>
                    {mappingConceptWithIcon[price.concept].value}{" "}
                    <div className="inline-block">
                      {mappingConceptWithIcon[price.concept].icon}
                    </div>
                    : ${formatCurrency(price.price * price.quantity)}
                  </div>
                ))}
              {Boolean(totalDevolutionPrices) && (
                <>
                  <div className="mr-2 text-white text-base font-bold">
                    Total a descontar: ${formatCurrency(totalDevolutionPrices)}
                  </div>

                  <br />
                </>
              )}{" "}
              <>
                <div className="mr-2 text-white text-base font-bold">
                  Total a pagar: ${formatCurrency(totalToPay)}
                </div>
              </>
              <div className="h-[6vh]">
                {percentageToDisccountOrAdd !== 0 && (
                  <>
                    <div className="mr-2 text-white text-base">
                      {percentageToDisccountOrAdd > 0
                        ? "Gastos bancarios"
                        : "Descuentos"}
                      : ${formatCurrency(calculateTotalDiscount)}
                    </div>
                  </>
                )}
                <div className="mr-2 text-white text-lg font-bold">
                  Total Final: $
                  {formatCurrency(
                    totalToPay *
                      calculateTotalPercentage(percentageToDisccountOrAdd)
                  )}
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
                  !isLoading && !inboundSale && availableAction && handleSale()
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
            title="Ingrese Num"
          />
        </div>
      )}
    </>
  );
};

export default ConfirmSale;
