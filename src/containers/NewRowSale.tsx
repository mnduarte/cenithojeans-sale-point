import { useState } from "react";
import { MdClose } from "react-icons/md";
import KeyboardNum from "../components/KeyboardNum";
import { useEmployee } from "../contexts/EmployeeContext";
import { cashflowActions, useCashflow } from "../contexts/CashflowContext";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";
import { saleActions, useSale } from "../contexts/SaleContext";
import { useUser } from "../contexts/UserContext";

const NewRowSale = ({
  isModalNewRowSale,
  setIsModalNewRowSale,
  employee,
}: any) => {
  const {
    state: { employees },
  } = useEmployee();

  const {
    state: { user },
  } = useUser();

  const {
    state: { loading },
    dispatch: dispatchSale,
  } = useSale();

  /*const [items, setItems] = useState(0);
  const [total, setTotal] = useState(0);
  
  const [value, setValue] = useState(0);*/
  const [dataIndex, setDataIndex] = useState<any>("");
  const [propSale, setPropSale] = useState<any>({
    items: 0,
    total: 0,
  });

  const [isModalKeyboardNumOpen, setIsModalKeyboardNumOpen] = useState(false);

  const closeModal = () => {
    setPropSale({
      items: 0,
      total: 0,
    });
    setDataIndex("");
    setIsModalNewRowSale(false);
  };

  const handleNewSaleRow = () => {
    const foundEmployee = employees.find((emp) => emp.name === employee);

    dispatchSale(
      saleActions.addNewSaleByEmployee({
        ...propSale,
        employee: foundEmployee.name,
        store: foundEmployee.store,
        username: user.username,
      })(dispatchSale)
    );

    setPropSale({
      items: 0,
      total: 0,
    });
    setDataIndex("");
    setIsModalNewRowSale(false);
  };

  const handleManualNumOrder = (item: any) => {
    if (item.action === "deleteLast") {
      return setPropSale((currentValue: any) => ({
        ...currentValue,
        [dataIndex]: Number(String(currentValue[dataIndex]).slice(0, -1)),
      }));
    }

    if (item.action === "addPrice") {
      return setIsModalKeyboardNumOpen(false);
    }

    setPropSale((currentValue: any) => ({
      ...currentValue,
      [dataIndex]: Number(String(currentValue[dataIndex]) + String(item.value)),
    }));
  };

  return (
    <>
      {isModalNewRowSale && (
        <div className="fixed inset-0 bg-[#252525] bg-opacity-60 flex items-center justify-center">
          {/* Contenido del modal */}
          <div className="w-[50vh] bg-gray-800 border border-[#000000] p-8 rounded shadow-md relative">
            {/* Icono de cerrar en la esquina superior derecha */}
            <button
              className="absolute top-4 right-4 text-white"
              onClick={closeModal}
            >
              <MdClose className="text-2xl" />
            </button>

            <h2 className="text-white text-lg font-bold mb-4">
              Nueva Venta - {employee}
            </h2>

            <div className="mb-4 h-[5vh] flex items-center justify-start">
              <label className="mr-2 text-white">Agrege Prendas:</label>

              <input
                type="text"
                className="w-[10vh] p-2 border border-[#484E55] rounded-md mr-2"
                readOnly
                value={propSale.items}
                onFocus={() => {
                  setDataIndex("items");
                  setIsModalKeyboardNumOpen(true);
                }}
              />
            </div>

            <div className="mb-4 h-[5vh] flex items-center justify-start">
              <label className="mr-2 text-white">Agrege Total:</label>

              <input
                type="text"
                className="w-[10vh] p-2 border border-[#484E55] rounded-md mr-2"
                readOnly
                value={propSale.total}
                onFocus={() => {
                  setDataIndex("total");
                  setIsModalKeyboardNumOpen(true);
                }}
              />
            </div>

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
                  !Boolean(propSale.items) || !Boolean(propSale.total)
                    ? "bg-gray-500"
                    : "bg-green-800 hover:bg-green-800 hover:cursor-pointer"
                } w-1/2 text-white px-4 py-2 rounded-md flex items-center justify-center mx-auto select-none `}
                onClick={() =>
                  Boolean(propSale.items) &&
                  Boolean(propSale.total) &&
                  handleNewSaleRow()
                }
              >
                Agregar
                {loading && (
                  <div className="ml-2">
                    <Spinner />
                  </div>
                )}
              </div>
            </div>
          </div>
          <KeyboardNum
            isModalKeyboardNumOpen={isModalKeyboardNumOpen}
            manualNum={propSale[dataIndex]}
            handleManualNum={handleManualNumOrder}
            closeModal={() => setIsModalKeyboardNumOpen(false)}
            title={`Ingrese ${dataIndex}`}
          />
        </div>
      )}
    </>
  );
};

export default NewRowSale;
