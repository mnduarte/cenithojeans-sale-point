import { useEffect, useState } from "react";
import { useEmployee } from "../contexts/EmployeeContext";
import { saleActions, useSale } from "../contexts/SaleContext";
import { formatCurrency, formatDateToYYYYMMDD } from "../utils/formatUtils";
import Spinner from "../components/Spinner";
import { useUser } from "../contexts/UserContext";
import KeyboardNum from "../components/KeyboardNum";
import Toast from "../components/Toast";
import EditableTable from "../components/EditableTable";
import { MdOutlinePendingActions } from "react-icons/md";

const mappingConceptToUpdate: Record<string, string> = {
  order: "N° Pedido",
  cash: "Efectivo",
  transfer: "Transferencia",
  items: "Prendas",
  total: "Total",
};

const OrdersContainer = () => {
  const {
    state: { employees },
  } = useEmployee();
  const {
    state: {
      orders,
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
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    store: user.store === "ALL" ? "" : user.store,
    employee: "",
    typeSale: "pedido",
    typeShipment: "",
  });
  const [ordersFiltered, setOrdersFiltered] = useState<any[]>([]);

  const [value, setValue] = useState(0);
  const [propSale, setPropSale] = useState({
    id: "",
    dataIndex: "",
  });
  const [isModalKeyboardNumOpen, setIsModalKeyboardNumOpen] = useState(false);
  const [itemsIdSelected, setItemsIdSelected] = useState<any[]>([]);

  const [editableRow, setEditableRow] = useState<number | null>(null);

  const columns = [
    { title: "Fecha", dataIndex: "date" },
    {
      title: "Vendedor",
      dataIndex: "employee",
      editableCell: true,
      type: "select",
      dataSelect: employees.map(({ name }) => name),
    },
    { title: "N°", dataIndex: "order", editableCell: true, type: "string" },
    { title: "Sucursal", dataIndex: "store" },
    {
      title: "Tipo",
      dataIndex: "typeShipment",
      editableCell: true,
      type: "select",
      dataSelect: ["retiraLocal", "envio"],
    },
    {
      title: "Transferencia",
      dataIndex: "transfer",
      editableCell: true,
      type: "string",
      format: (number: any) => `$${formatCurrency(number)}`,
      sumAcc: user.role === "ADMIN",
    },
    {
      title: "Efectivo",
      dataIndex: "cash",
      editableCell: true,
      type: "string",
      format: (number: any) => `$${formatCurrency(number)}`,
      sumAcc: user.role === "ADMIN",
    },
    {
      title: "Prendas",
      dataIndex: "items",
      editableCell: true,
      type: "string",
    },
    {
      title: "Total",
      dataIndex: "total",
      format: (number: any) => `$${formatCurrency(number)}`,
      editableCell: true,
      type: "string",
      sumAcc: user.role === "ADMIN",
    },
    {
      title: <MdOutlinePendingActions />,
      defaultValue: <MdOutlinePendingActions />,
      dataIndex: "checkoutDate",
      editableCell: true,
      type: "button",
    },
    {
      title: "Salida",
      dataIndex: "checkoutDate",
      editableCell: true,
      type: "date",
    },
  ];

  const handleEditClick = (rowIndex: number) => {
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
        saleActions.updateOrder({ ...propSale, value })(dispatchSale)
      );
      setValue(0);
      setEditableRow(null);
      return setIsModalKeyboardNumOpen(false);
    }

    setValue((currentValue: any) =>
      Number(String(currentValue) + String(item.value))
    );
  };

  const handleAction = ({
    dataIndex,
    value,
    id,
    inputType,
    inputValue,
  }: any) => {
    if (inputType === "string") {
      setPropSale({ dataIndex, id });
      setValue(value ? value : 0);
      setIsModalKeyboardNumOpen(true);
    }

    if (inputType === "date" || inputType === "select") {
      dispatchSale(
        saleActions.updateOrder({
          dataIndex,
          id,
          value: inputValue.target.value,
        })(dispatchSale)
      );
      setEditableRow(null);
    }

    if (inputType === "button") {
      dispatchSale(
        saleActions.updateOrder({
          dataIndex,
          id,
          value: formatDateToYYYYMMDD(new Date()),
        })(dispatchSale)
      );
      setTimeout(() => {
        setEditableRow(null);
      }, 50);
    }
  };

  const onOrderAscDesc = (e: any) => {
    setOrdersFiltered((items: any) =>
      items
        .slice()
        .sort((a: any, b: any) =>
          e.target.value === "lower" ? a.order - b.order : b.order - a.order
        )
    );
  };

  useEffect(() => {
    if (orders.length) {
      setOrdersFiltered(orders);
    }
  }, [orders]);

  return (
    <>
      <div className="h-[8vh] relative p-2 border border-[#484E55] flex justify-center">
        <div className="inline-block">
          <label className="mr-2 text-white">Desde:</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={({ target }: any) =>
              setFilters((props) => ({ ...props, startDate: target.value }))
            }
            className="p-2 border border-gray-300 rounded-md"
          />
          <label className="ml-2 mr-2 text-white">Hasta:</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={({ target }: any) =>
              setFilters((props) => ({ ...props, endDate: target.value }))
            }
            className="p-2 border border-gray-300 rounded-md"
          />
        </div>

        {user.store === "ALL" && (
          <div className="ml-4 inline-block">
            <label className="mr-2 text-white">Filtrar por sucursal:</label>
            <select
              className="p-2 border border-[#484E55] rounded-md"
              onChange={({ target }: any) =>
                setFilters((props) => ({ ...props, store: target.value }))
              }
              defaultValue=""
            >
              <option value="" className="py-2">
                Todos
              </option>
              <option value="BOGOTA" className="py-2">
                Bogota
              </option>
              <option value="HELGUERA" className="py-2">
                Helguera
              </option>
            </select>
          </div>
        )}
        <div className="ml-4 inline-block">
          <label className="mr-2 text-white">por vendedor:</label>
          <select
            className="p-2 border border-[#484E55] rounded-md"
            onChange={({ target }: any) =>
              setFilters((props) => ({ ...props, employee: target.value }))
            }
            defaultValue=""
          >
            <option value="" className="py-2">
              Todos
            </option>
            {employees.map((employee: any) => (
              <option value={employee.name} key={employee.id} className="py-2">
                {employee.name}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-10 inline-block">
          <div
            className={`inline-block px-4 py-2 rounded-md border text-white select-none ${
              Boolean(filters.startDate.length) &&
              Boolean(filters.endDate.length) &&
              "bg-[#1b78e2] border-[#1b78e2] hover:cursor-pointer hover:opacity-80 transition-opacity"
            } flex items-center mx-auto`}
            onClick={() =>
              !loading &&
              dispatchSale(saleActions.getOrders(filters)(dispatchSale))
            }
          >
            Buscar
            {loading && (
              <div className="ml-2">
                <Spinner />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-[8vh] relative p-2 border border-[#484E55] flex items-center">
        <div className="ml-4 inline-block">
          <label className="mr-2 text-white">Ordenar por Pedido:</label>
          <select
            className="p-1 border border-[#484E55] rounded-md"
            onChange={onOrderAscDesc}
            defaultValue=""
          >
            <option value="" className="py-2" disabled hidden>
              -
            </option>
            <option value="higher" className="py-2">
              Mayor
            </option>
            <option value="lower" className="py-2">
              Menor
            </option>
          </select>
        </div>

        <div className="ml-4 inline-block">
          <label className="mr-2 text-white">Filtrar por Tipo:</label>
          <select
            className="p-1 border border-[#484E55] rounded-md"
            onChange={({ target }: any) =>
              setFilters((props) => ({ ...props, typeShipment: target.value }))
            }
            defaultValue=""
          >
            <option value="" className="py-2">
              Todos
            </option>
            <option value="retiraLocal" className="py-2">
              Retira local
            </option>
            <option value="envio" className="py-2">
              Envio
            </option>
          </select>
        </div>

        {Boolean(itemsIdSelected.length) && (
          <div
            className="w-25 h-10 ml-2 bg-red-700 hover:bg-red-800 hover:cursor-pointer text-white px-4 py-2 rounded-md flex items-center justify-center select-none"
            onClick={() => {
              setItemsIdSelected([]);
              dispatchSale(
                saleActions.cancelOrders({
                  itemsIdSelected,
                })(dispatchSale)
              );
            }}
          >
            Anular Pedidos Seleccionados
          </div>
        )}
      </div>

      <div className="mt-5 h-[70vh] mx-auto max-w overflow-hidden overflow-y-auto overflow-x-auto">
        <EditableTable
          data={ordersFiltered}
          columns={columns}
          handleAction={handleAction}
          editableRow={editableRow}
          handleEditClick={handleEditClick}
          itemsIdSelected={itemsIdSelected}
          setItemsIdSelected={setItemsIdSelected}
          enableSelectItem={true}
        />
      </div>

      <KeyboardNum
        isModalKeyboardNumOpen={isModalKeyboardNumOpen}
        manualNum={value}
        handleManualNum={handleManualValue}
        closeModal={() => {
          setValue(0);
          setEditableRow(null);
          setIsModalKeyboardNumOpen(false);
        }}
        title={"Ingrese " + mappingConceptToUpdate[propSale.dataIndex]}
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

export default OrdersContainer;
