import { useState } from "react";
import { MdClose } from "react-icons/md";
import { calculateTotalPercentage, formatCurrency } from "../utils/formatUtils";
import Spinner from "../components/Spinner";
import { FaMinus, FaPlus } from "react-icons/fa";

const ConfirmSale = ({
  employees,
  isModalSaleOpen,
  setIsModalSaleOpen,
  totalItems,
  totalDevolutionItems,
  totalPrice,
  onSale,
  isLoading,
  setPricesSelected,
  setDevolutionPricesSelected,
  inboundSale,
  handlePrintSale,
  setDevolutionModeActive,
  percentageToDisccountOrAdd,
  setPercentageToDisccountOrAdd,
}: any) => {
  const [sellerSelected, setSellerSelected] = useState("");
  const [typeSale, setTypeSale] = useState("");
  const [typePayment, setTypePayment] = useState("");

  const availableAction =
    Boolean(sellerSelected.length) &&
    ((typeSale === "pedido" && Boolean(typePayment.length)) ||
      typeSale === "local");

  const closeModalSale = () => {
    setSellerSelected("");
    setTypeSale("");
    setTypePayment("");
    setDevolutionModeActive(false);
    setIsModalSaleOpen(false);
  };

  const handleSale = () => {
    const data = {
      employee: sellerSelected,
      typeSale,
      typePayment,
    };
    onSale(data);
  };

  const onCleanAndClose = () => {
    setPricesSelected([]);
    setDevolutionPricesSelected([]);
    setPercentageToDisccountOrAdd(0);
    closeModalSale();
  };

  const multiplyBy = percentageToDisccountOrAdd < 0 ? 1 : -1;
  const calculateTotalDiscount =
    multiplyBy *
    (totalPrice -
      totalPrice *
        calculateTotalPercentage(Math.abs(percentageToDisccountOrAdd)));

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
                  Pedidos
                </option>
              </select>
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
                    <div className="w-10 h-12 pr-1 border border-[#484E55] text-white text-center flex items-center justify-center select-none">
                      {percentageToDisccountOrAdd}
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
              <p className="mr-2 text-white">Total de prendas: {totalItems}</p>
              {Boolean(totalDevolutionItems) && (
                <p className="mr-2 text-white">
                  Devoluciones: {totalDevolutionItems}
                </p>
              )}
              <p className="mr-2 text-white text-base font-bold">
                Total: ${formatCurrency(totalPrice)}
              </p>
              <div className="h-[6vh]">
                {percentageToDisccountOrAdd !== 0 && (
                  <>
                    <p className="mr-2 text-white text-base">
                      {percentageToDisccountOrAdd > 0
                        ? "Gastos bancarios"
                        : "Descuentos"}
                      : ${formatCurrency(calculateTotalDiscount)}
                    </p>
                    <p className="mr-2 text-white text-base font-bold">
                      Total Final: $
                      {formatCurrency(
                        totalPrice *
                          calculateTotalPercentage(percentageToDisccountOrAdd)
                      )}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <div
                className="w-1/2 bg-blue-500 hover:bg-blue-700 hover:cursor-pointer text-white px-4 py-2 rounded-md flex items-center justify-center mx-auto select-none"
                onClick={() => handlePrintSale(sellerSelected)}
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
        </div>
      )}
    </>
  );
};

export default ConfirmSale;
