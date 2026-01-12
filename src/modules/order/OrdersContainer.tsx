import { useEffect, useState } from "react";
import { useEmployee } from "../../contexts/EmployeeContext";
import { useCashier } from "../../contexts/CashierContext";
import { saleActions, useSale } from "../../contexts/SaleContext";
import { formatCurrency, formatDateToYYYYMMDD } from "../../utils/formatUtils";
import Spinner from "../../components/Spinner";
import { useUser } from "../../contexts/UserContext";
import KeyboardNum from "../../components/KeyboardNum";
import Toast from "../../components/Toast";
import EditableTable from "../../components/EditableTable";
import Keyboard from "../../components/Keyboard";
import {
  MdCleaningServices,
  MdOutlineApproval,
  MdOutlinePendingActions,
} from "react-icons/md";
import dayjs from "dayjs";
import { DatePicker, Select, Tag } from "antd";
import {
  dateFormat,
  listStore,
  mappingCheckoutDate,
  mappingListStore,
  mappingTypeShipment,
} from "../../utils/constants";
import { useTheme } from "../../contexts/ThemeContext";
import { MdClose } from "react-icons/md";
import * as XLSX from "xlsx";
import ModalSearchByText from "./ModalSearchByText";

const mappingConceptToUpdate: Record<string, string> = {
  order: "N° Pedido",
  cash: "Efectivo",
  transfer: "Transferencia",
  items: "Prendas",
  total: "Total",
};

const ModalCancellation = ({ isModalOpen, setIsModalOpen, onSubmit }: any) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();
  const {
    state: { user },
  } = useUser();
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const handleSubmit = () => {
    onSubmit({
      reason: reason === "Otro" ? reason + " - " + customReason : reason,
      user: user.username,
    });
    setReason("");
    setCustomReason("");
    setIsModalOpen(false);
  };

  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#252525] bg-opacity-60 flex items-center justify-center">
          {/* Contenido del modal */}
          <div
            className={`w-[520px] p-8 rounded-md shadow-md relative ${themeStyles[theme].tailwindcss.modal}`}
          >
            {/* Icono de cerrar en la esquina superior derecha */}
            <button
              className="absolute top-4 right-4"
              onClick={() => {
                setIsModalOpen(false);
              }}
            >
              <MdClose className="text-2xl" />
            </button>

            <h2 className="text-lg font-bold mb-4">
              Seleccione Motivo de anulacion
            </h2>

            <Select
              value={reason}
              className={themeStyles[theme].classNameSelector}
              dropdownStyle={{
                ...themeStyles[theme].dropdownStylesCustom,
                width: 250,
              }}
              popupClassName={themeStyles[theme].classNameSelectorItem}
              style={{ width: 250, marginBottom: "1rem" }}
              onSelect={(value: any) => setReason(value)}
              options={[
                { name: "No contesta" },
                { name: "Hizo otro pedido" },
                { name: "Pedido duplicado" },
                { name: "Otro" },
              ].map((data: any) => ({
                value: data.name,
                label: data.name,
              }))}
            />

            <br />

            {reason === "Otro" && (
              <>
                <div className="mb-4">
                  <textarea
                    value={customReason}
                    readOnly
                    className={`w-[420px] p-2 rounded-md mr-2 text-lg ${themeStyles[theme].tailwindcss.inputText}`}
                  />
                </div>
                <Keyboard
                  onKeyPress={(e: any) => {
                    let newDescription = customReason;

                    if (e.action === "deleteLast") {
                      newDescription = newDescription.slice(0, -1);
                    }

                    if (e.action === "addSpace") {
                      newDescription = newDescription + " ";
                    }

                    if (!e.action) {
                      newDescription = newDescription + e.value.toLowerCase();
                    }

                    setCustomReason(newDescription);
                  }}
                />
              </>
            )}
            <br />

            <div className="flex space-x-4">
              <div
                className="w-1/2 bg-blue-800 hover:bg-blue-800 hover:cursor-pointer text-white px-4 py-2 rounded-md flex items-center justify-center mx-auto select-none"
                onClick={() => {
                  setIsModalOpen(false);
                }}
              >
                Cancelar
              </div>
              <div
                className={`${
                  !Boolean(reason)
                    ? "bg-gray-500"
                    : "bg-green-800 hover:bg-green-800 hover:cursor-pointer"
                }  w-1/2 text-white px-4 py-2 rounded-md flex items-center justify-center mx-auto select-none `}
                onClick={() => Boolean(reason) && handleSubmit()}
              >
                Guardar
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const OrdersContainer = () => {
  const {
    state: { theme, themeStyles },
  } = useTheme();
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
  const { cashiers, fetchAllCashiers } = useCashier();
  const [cashierFilter, setCashierFilter] = useState<string>("none");

  const getStoredCashier = () => {
    const stored = localStorage.getItem("selectedCashier");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  };

  const [filters, setFilters] = useState({
    startDate: formatDateToYYYYMMDD(new Date()),
    endDate: formatDateToYYYYMMDD(new Date()),
    store: user.store === "ALL" ? "" : user.store,
    employee: "",
    typeSale: "pedido",
    typeShipment: "",
    checkoutDate: "",
    q: "",
  });
  const [checkoutDatefilters, setCheckoutDateFilters] = useState({
    startDate: formatDateToYYYYMMDD(new Date()),
    endDate: formatDateToYYYYMMDD(new Date()),
    store: user.store === "ALL" ? "" : user.store,
    typeSale: "pedido",
    typeShipment: "",
    employee: "",
  });
  const [ordersFiltered, setOrdersFiltered] = useState<any[]>([]);

  const [value, setValue] = useState(0);
  const [propSale, setPropSale] = useState({
    id: "",
    dataIndex: "",
  });
  const [isModalKeyboardNumOpen, setIsModalKeyboardNumOpen] = useState(false);
  const [isModalSearchByTextOpen, setIsModalSearchByTextOpen] = useState(false);
  const [isModalCancellationReasonOpen, setIsModalCancellationReasonOpen] =
    useState(false);
  const [itemsSelected, setItemsSelected] = useState<any[]>([]);

  const [showToastDetail, setShowToastDetail] = useState(false);

  const [editableRow, setEditableRow] = useState<number | null>(null);
  const [selectedOrderCancelled, setSelectedOrderCancelled] =
    useState<any>(null);

  let timeoutId: ReturnType<typeof setTimeout>;

  const statusRelatedToCostByCost: any = {
    approved: "text-green-500",
    approvedHasCash: "text-orange-500",
    partialPayment: "text-red-500",
  };

  const columns = [
    {
      title: "Fecha",
      dataIndex: "date",
      render: (row: any) => {
        const displayCashierId = row.lastEditCashierId || row.cashierId;
        const displayCashierName = row.lastEditCashierName || row.cashierName;
        const cashier = displayCashierId
          ? cashiers.find((c: any) => (c.id || c._id) === displayCashierId)
          : null;

        return (
          <div className="flex flex-col">
            <span>{row.date}</span>
            {displayCashierName && (
              <span className="text-gray-400 text-xs inline-flex items-center gap-1">
                {cashier && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: cashier.color,
                      display: "inline-block",
                    }}
                  />
                )}
                {displayCashierName}
              </span>
            )}
          </div>
        );
      },
    },
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
      title: <MdOutlineApproval className="w-full" />,
      dataIndex: "statusRelatedToCost",
      editableCell: true,
      defaultValue: (e: any) =>
        !Boolean(e) || e === "withoutPayment" ? (
          "-"
        ) : (
          <div className="flex justify-center items-center">
            <MdOutlineApproval
              className={`text-2xl ${statusRelatedToCostByCost[e]}`}
            />
          </div>
        ),
    },
    /*{
      title: <MdOutlineApproval className="w-full" />,
      dataIndex: "approved",
      editableCell: true,
      defaultValue: (e: any) =>
        e ? (
          <div className="flex justify-center items-center">
            <FcApproval className="text-2xl" />
          </div>
        ) : (
          "-"
        ),
    },*/
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
      applyFormat: true,
    },
    {
      title: "Efectivo",
      dataIndex: "cash",
      editableCell: true,
      type: "string",
      format: (number: any) => `$${formatCurrency(number)}`,
      sumAcc: user.role === "ADMIN",
      applyFormat: true,
      applyColorText: true,
    },
    {
      title: "Prendas",
      dataIndex: "items",
      editableCell: true,
      type: "string",
      sumAcc: true,
    },
    {
      title: "Total",
      dataIndex: "total",
      format: (number: any) => `$${formatCurrency(number)}`,
      editableCell: true,
      type: "string",
      sumAcc: user.role === "ADMIN",
      applyFormat: true,
    },
    {
      title: <MdOutlinePendingActions />,
      defaultValue: () => <MdOutlinePendingActions />,
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
      const storedCashier = getStoredCashier();
      const cashierData = storedCashier
        ? { cashierId: storedCashier.id, cashierName: storedCashier.name }
        : {};

      dispatchSale(
        saleActions.updateOrder({ ...propSale, value, ...cashierData })(
          dispatchSale
        )
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
    const storedCashier = getStoredCashier();
    const cashierData = storedCashier
      ? { cashierId: storedCashier.id, cashierName: storedCashier.name }
      : {};

    if (inputType === "string") {
      setPropSale({ dataIndex, id });
      setValue(value ? value : 0);
      setIsModalKeyboardNumOpen(true);
    }

    if (inputType === "date") {
      dispatchSale(
        saleActions.updateOrder({
          dataIndex,
          id,
          value: formatDateToYYYYMMDD(new Date(inputValue)),
          ...cashierData,
        })(dispatchSale)
      );
      setTimeout(() => {
        setEditableRow(null);
      }, 50);
    }

    if (inputType === "select") {
      dispatchSale(
        saleActions.updateOrder({
          dataIndex,
          id,
          value: inputValue.value,
          ...cashierData,
        })(dispatchSale)
      );
      setTimeout(() => {
        setEditableRow(null);
      }, 50);
    }

    if (inputType === "button") {
      dispatchSale(
        saleActions.updateOrder({
          dataIndex,
          id,
          value: formatDateToYYYYMMDD(new Date()),
          ...cashierData,
        })(dispatchSale)
      );
      setTimeout(() => {
        setEditableRow(null);
      }, 50);
    }
  };

  const onOrderAscDesc = (value: any) => {
    setOrdersFiltered((items: any) =>
      items
        .slice()
        .sort((a: any, b: any) =>
          value === "lower" ? a.order - b.order : b.order - a.order
        )
    );
  };

  useEffect(() => {
    fetchAllCashiers();
  }, []);

  useEffect(() => {
    setOrdersFiltered(orders);
  }, [orders]);

  const downloadExcel = () => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const formattedTime = now
      .toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(/:/g, "-");

    const fileName = `pedidos-${formattedDate}-${formattedTime}.xlsx`;

    // Mapear los datos de ordersFiltered a un formato adecuado para Excel
    const formattedData = ordersFiltered.map((order: any) => ({
      Fecha: order.date || "-",
      Vendedor: order.employee || "-",
      "N° Orden": order.order || "-",
      Sucursal: order.store || "-",
      Aprobado: order.approved ? "Sí" : "No",
      Tipo: order.typeShipment || "-",
      Transferencia: `$${formatCurrency(order.transfer)}`,
      Efectivo: `$${formatCurrency(order.cash)}`,
      Prendas: order.items || "-",
      Total: `$${formatCurrency(order.total)}`,
      Salida: order.checkoutDate || "-",
    }));

    // Crear hoja de trabajo y libro
    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    // Descargar el archivo
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <>
      {/* Fila 1: Filtros principales */}
      <div
        className={`min-h-[48px] relative p-2 border-x border-t ${themeStyles[theme].tailwindcss.border} flex flex-wrap items-center justify-center gap-2`}
      >
        <div className="inline-flex items-center">
          <label className="mr-1">Desde:</label>
          <DatePicker
            onChange={(date: any) =>
              setFilters((props) => ({
                ...props,
                startDate: date.format("YYYY-MM-DD"),
              }))
            }
            className={themeStyles[theme].datePickerIndicator}
            style={themeStyles[theme].datePicker}
            popupClassName={themeStyles[theme].classNameDatePicker}
            allowClear={false}
            format={dateFormat}
            value={dayjs(filters.startDate)}
          />
        </div>

        <div className="inline-flex items-center">
          <label className="mr-1">Hasta:</label>
          <DatePicker
            onChange={(date: any) =>
              setFilters((props) => ({
                ...props,
                endDate: date.format("YYYY-MM-DD"),
              }))
            }
            className={themeStyles[theme].datePickerIndicator}
            style={themeStyles[theme].datePicker}
            popupClassName={themeStyles[theme].classNameDatePicker}
            allowClear={false}
            format={dateFormat}
            value={dayjs(filters.endDate)}
          />
        </div>

        {user.store === "ALL" && (
          <div className="inline-flex items-center">
            <label className="mr-1">Sucursal:</label>
            <Select
              value={mappingListStore[filters.store]}
              className={themeStyles[theme].classNameSelector}
              dropdownStyle={themeStyles[theme].dropdownStylesCustom}
              popupClassName={themeStyles[theme].classNameSelectorItem}
              style={{ width: 100 }}
              onSelect={(value: any) =>
                setFilters((props) => ({ ...props, store: value }))
              }
              options={listStore.map((data: any) => ({
                value: data.value === "ALL" ? "" : data.value,
                label: data.name,
              }))}
            />
          </div>
        )}

        <div className="inline-flex items-center">
          <label className="mr-1">Vendedor:</label>
          <Select
            value={filters.employee === "" ? "Todos" : filters.employee}
            className={themeStyles[theme].classNameSelector}
            dropdownStyle={themeStyles[theme].dropdownStylesCustom}
            popupClassName={themeStyles[theme].classNameSelectorItem}
            style={{ width: 110 }}
            onSelect={(value: any) =>
              setFilters((props) => ({
                ...props,
                employee: value,
              }))
            }
            options={[
              { label: "Todos", value: "" },
              ...employees.map((data: any) => ({
                value: data.name,
                label: data.name,
              })),
            ]}
          />
        </div>

        <div className="inline-flex items-center">
          <label className="mr-1">Tipo:</label>
          <Select
            value={mappingTypeShipment[filters.typeShipment]}
            className={themeStyles[theme].classNameSelector}
            dropdownStyle={themeStyles[theme].dropdownStylesCustom}
            popupClassName={themeStyles[theme].classNameSelectorItem}
            style={{ width: 100 }}
            onSelect={(value: any) =>
              setFilters((props) => ({
                ...props,
                typeShipment: value,
              }))
            }
            options={[
              { label: "Todos", value: "" },
              { label: "Retira local", value: "retiraLocal" },
              { label: "Envio", value: "envio" },
            ]}
          />
        </div>

        <div className="inline-flex items-center">
          <label className="mr-1">Salida:</label>
          <Select
            value={mappingCheckoutDate[filters.checkoutDate]}
            className={themeStyles[theme].classNameSelector}
            dropdownStyle={themeStyles[theme].dropdownStylesCustom}
            popupClassName={themeStyles[theme].classNameSelectorItem}
            style={{ width: 100 }}
            onSelect={(value: any) =>
              setFilters((props) => ({
                ...props,
                checkoutDate: value,
              }))
            }
            options={[
              { label: "Todos", value: "" },
              { label: "Con Salida", value: "with" },
              { label: "Sin Salida", value: "wihtout" },
            ]}
          />
        </div>

        <div className="inline-flex items-center gap-1">
          <input
            type="text"
            className={`w-[90px] p-1 border-2 border-[#1BA1E2] rounded-md text-center hover:cursor-pointer ${themeStyles[theme].tailwindcss.inputText}`}
            value={filters.q}
            placeholder="Texto"
            onClick={() => setIsModalSearchByTextOpen(true)}
          />
          <div
            className="bg-gray-700 w-5 text-white py-1 rounded-md flex items-center justify-center select-none transition-opacity duration-200 hover:opacity-80 active:scale-95 cursor-pointer"
            onClick={() =>
              setFilters((props: any) => ({
                ...props,
                q: "",
              }))
            }
          >
            <MdCleaningServices />
          </div>
        </div>

        <div
          className={`px-4 py-1 rounded-md border text-white select-none ${
            Boolean(filters.startDate.length) &&
            Boolean(filters.endDate.length)
              ? "bg-[#1b78e2] border-[#1b78e2] hover:cursor-pointer hover:opacity-80 transition-opacity"
              : ""
          } flex items-center`}
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

        <div
          className="bg-green-800 hover:bg-green-900 hover:cursor-pointer text-white px-2 py-1 rounded-md flex items-center justify-center select-none"
          onClick={downloadExcel}
        >
          Excel
        </div>
      </div>

      {/* Fila 2: Filtros de salida */}
      <div
        className={`min-h-[48px] relative p-2 border-x ${themeStyles[theme].tailwindcss.border} flex flex-wrap items-center justify-center gap-2`}
      >
        <div className="inline-flex items-center">
          <label className="mr-1">Ordenar:</label>
          <Select
            className={themeStyles[theme].classNameSelector}
            dropdownStyle={themeStyles[theme].dropdownStylesCustom}
            popupClassName={themeStyles[theme].classNameSelectorItem}
            style={{ width: 90 }}
            onSelect={onOrderAscDesc}
            options={[
              { label: "Mayor", value: "higher" },
              { label: "Menor", value: "lower" },
            ]}
          />
        </div>

        <div className="inline-flex items-center">
          <label className="mr-1">Salida Desde:</label>
          <DatePicker
            onChange={(date: any) =>
              setCheckoutDateFilters((props) => ({
                ...props,
                startDate: date.format("YYYY-MM-DD"),
              }))
            }
            className={themeStyles[theme].datePickerIndicator}
            style={themeStyles[theme].datePicker}
            popupClassName={themeStyles[theme].classNameDatePicker}
            allowClear={false}
            format={dateFormat}
            value={dayjs(checkoutDatefilters.startDate)}
          />
        </div>

        <div className="inline-flex items-center">
          <label className="mr-1">Hasta:</label>
          <DatePicker
            onChange={(date: any) =>
              setCheckoutDateFilters((props) => ({
                ...props,
                endDate: date.format("YYYY-MM-DD"),
              }))
            }
            className={themeStyles[theme].datePickerIndicator}
            style={themeStyles[theme].datePicker}
            popupClassName={themeStyles[theme].classNameDatePicker}
            allowClear={false}
            format={dateFormat}
            value={dayjs(checkoutDatefilters.endDate)}
          />
        </div>

        {user.store === "ALL" && (
          <div className="inline-flex items-center">
            <label className="mr-1">Sucursal:</label>
            <Select
              value={mappingListStore[checkoutDatefilters.store]}
              className={themeStyles[theme].classNameSelector}
              dropdownStyle={themeStyles[theme].dropdownStylesCustom}
              popupClassName={themeStyles[theme].classNameSelectorItem}
              style={{ width: 100 }}
              onSelect={(value: any) =>
                setCheckoutDateFilters((props) => ({ ...props, store: value }))
              }
              options={listStore.map((data: any) => ({
                value: data.value === "ALL" ? "" : data.value,
                label: data.name,
              }))}
            />
          </div>
        )}

        <div className="inline-flex items-center">
          <label className="mr-1">Vendedor:</label>
          <Select
            value={
              checkoutDatefilters.employee === ""
                ? "Todos"
                : checkoutDatefilters.employee
            }
            className={themeStyles[theme].classNameSelector}
            dropdownStyle={themeStyles[theme].dropdownStylesCustom}
            popupClassName={themeStyles[theme].classNameSelectorItem}
            style={{ width: 110 }}
            onSelect={(value: any) =>
              setCheckoutDateFilters((props) => ({
                ...props,
                employee: value,
              }))
            }
            options={[
              { label: "Todos", value: "" },
              ...employees.map((data: any) => ({
                value: data.name,
                label: data.name,
              })),
            ]}
          />
        </div>

        <div className="inline-flex items-center">
          <label className="mr-1">Tipo:</label>
          <Select
            value={mappingTypeShipment[checkoutDatefilters.typeShipment]}
            className={themeStyles[theme].classNameSelector}
            dropdownStyle={themeStyles[theme].dropdownStylesCustom}
            popupClassName={themeStyles[theme].classNameSelectorItem}
            style={{ width: 100 }}
            onSelect={(value: any) =>
              setCheckoutDateFilters((props) => ({
                ...props,
                typeShipment: value,
              }))
            }
            options={[
              { label: "Todos", value: "" },
              { label: "Retira local", value: "retiraLocal" },
              { label: "Envio", value: "envio" },
            ]}
          />
        </div>

        <div
          className={`px-4 py-1 rounded-md border text-white select-none ${
            Boolean(checkoutDatefilters.startDate.length) &&
            Boolean(checkoutDatefilters.endDate.length)
              ? "bg-[#1b78e2] border-[#1b78e2] hover:cursor-pointer hover:opacity-80 transition-opacity"
              : ""
          } flex items-center`}
          onClick={() =>
            !loading &&
            dispatchSale(
              saleActions.getOrdersCheckoutDate(checkoutDatefilters)(
                dispatchSale
              )
            )
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

      {/* Fila 3: Cajero + Leyenda + Editando + Cantidad */}
      <div
        className={`min-h-[48px] relative p-2 border-x border-b ${themeStyles[theme].tailwindcss.border} flex flex-wrap items-center justify-center gap-3`}
      >
        <div className="inline-flex items-center">
          <label className="mr-1">Cajero:</label>
          <Select
            value={cashierFilter}
            className={themeStyles[theme].classNameSelector}
            dropdownStyle={themeStyles[theme].dropdownStylesCustom}
            popupClassName={themeStyles[theme].classNameSelectorItem}
            style={{ width: 120 }}
            onChange={(value: string) => setCashierFilter(value)}
            optionLabelProp="label"
          >
            <Select.Option value="none" label="Ninguno">
              Ninguno
            </Select.Option>
            <Select.Option value="all" label="Todos">
              Todos
            </Select.Option>
            {cashiers.map((c: any) => (
              <Select.Option
                key={c.id || c._id}
                value={String(c.id || c._id)}
                label={
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: c.color,
                        display: "inline-block",
                      }}
                    />
                    {c.name}
                  </span>
                }
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: c.color,
                      display: "inline-block",
                    }}
                  />
                  {c.name}
                </div>
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Leyenda de colores - solo visible cuando filtro es "all" */}
        {cashierFilter === "all" && cashiers.length > 0 && (
          <div className="inline-flex items-center gap-2 px-2 py-1 bg-gray-700/30 rounded">
            {cashiers.map((c: any) => (
              <div
                key={c.id || c._id}
                className="inline-flex items-center gap-1 text-xs text-gray-300"
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: c.color,
                    display: "inline-block",
                  }}
                />
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Indicador del cajero activo (del localStorage) */}
        {(() => {
          const storedCashier = getStoredCashier();
          if (storedCashier) {
            const cashierColor =
              cashiers.find((c: any) => c.id === storedCashier.id)?.color ||
              storedCashier.color;
            return (
              <div className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                <span>Editando:</span>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: cashierColor,
                    display: "inline-block",
                  }}
                />
                <span className="text-gray-200">{storedCashier.name}</span>
              </div>
            );
          }
          return (
            <div className="text-xs text-yellow-500">
              ⚠ Sin cajero en Ventas
            </div>
          );
        })()}

        <Tag color="#3B3B3B" className="py-1 px-2 text-sm">
          Cantidad Pedidos:{" "}
          {ordersFiltered.filter((order) => !Boolean(order.cancelled)).length}
        </Tag>
      </div>

      <div className={`h-[30px] flex`}>
        {Boolean(itemsSelected.filter((item) => !item.cancelled).length) && (
          <div
            className="w-[230px] ml-2 bg-red-700 hover:bg-red-800 hover:cursor-pointer text-white px-4 py-1 rounded-md flex items-center justify-center select-none"
            onClick={() => {
              setIsModalCancellationReasonOpen(true);
            }}
          >
            Anular Pedidos Seleccionados
          </div>
        )}
        {user.role === "ADMIN" &&
          Boolean(itemsSelected.filter((item) => item.cancelled).length) && (
            <div
              className="w-[230px] ml-2 bg-green-700 hover:bg-green-800 hover:cursor-pointer text-white px-4 py-1 rounded-md flex items-center justify-center select-none"
              onClick={() => {
                setItemsSelected([]);
                dispatchSale(
                  saleActions.enableOrders({
                    itemsIdSelected: itemsSelected
                      .filter((item) => item.cancelled)
                      .map(({ id }) => id),
                  })(dispatchSale)
                );
              }}
            >
              Habilitar Pedidos Seleccionados
            </div>
          )}
      </div>

      <div className="mt-5 h-[74vh] mx-auto max-w overflow-hidden overflow-y-auto overflow-x-auto">
        <EditableTable
          data={ordersFiltered}
          columns={columns}
          handleAction={handleAction}
          editableRow={editableRow}
          handleEditClick={(row: any, e: any) => {
            const orderSelected = ordersFiltered[row.split("-")[1]];

            if (orderSelected.cancelled) {
              setSelectedOrderCancelled({
                ...orderSelected,
                clientX: e.clientX,
                clientY: e.clientY,
              });
              setShowToastDetail(true);

              if (timeoutId) {
                clearTimeout(timeoutId);
              }

              timeoutId = setTimeout(() => {
                setShowToastDetail(false);
              }, 4000);

              return;
            }

            return handleEditClick(row);
          }}
          itemsIdSelected={itemsSelected}
          setItemsIdSelected={setItemsSelected}
          setAllValueRow={true}
          enableSelectItem={true}
          getCellStyle={(row: any, column: any) => {
            if (cashierFilter === "none") return {};

            // Determinar qué cajero usar según la columna
            const isCheckoutColumn = column.dataIndex === "checkoutDate";
            const cellCashierId = isCheckoutColumn
              ? row.checkoutCashierId
              : (row.lastEditCashierId || row.cashierId);

            if (!cellCashierId) return {};

            // Para "all", colorear según el cajero de cada celda
            if (cashierFilter === "all") {
              const cashier = cashiers.find(
                (c: any) => (c.id || c._id) === cellCashierId
              );
              if (cashier) {
                return {
                  backgroundColor: cashier.color + "30",
                };
              }
              return {};
            }

            // Para cajero específico, colorear solo si coincide
            const filterCashierId = parseInt(cashierFilter);
            if (cellCashierId === filterCashierId) {
              const cashier = cashiers.find(
                (c: any) => (c.id || c._id) === cellCashierId
              );
              if (cashier) {
                return {
                  backgroundColor: cashier.color + "30",
                };
              }
            }
            return {};
          }}
        />
        {Boolean(showToastDetail) && Boolean(selectedOrderCancelled) && (
          <div
            className={`absolute shadow-lg rounded-lg p-4 ${themeStyles[theme].tailwindcss.modal}`}
            style={{
              top: selectedOrderCancelled.clientY,
              left: selectedOrderCancelled.clientX,
            }}
          >
            <div>
              Motivo de anulacion:
              <span className="font-bold mx-2">
                {selectedOrderCancelled.cancellationReason}
              </span>
            </div>
            <div>
              Anulacion por usuario:
              <span className="font-bold mx-2">
                {selectedOrderCancelled.cancellationByUser}
              </span>
            </div>
            <div>
              Fecha de anulacion:
              <span className="font-bold mx-2">
                {selectedOrderCancelled.cancellationDate}
              </span>
            </div>
          </div>
        )}
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

      <ModalSearchByText
        isModalSearchByTextOpen={isModalSearchByTextOpen}
        setIsModalSearchByTextOpen={setIsModalSearchByTextOpen}
        handleSearchByText={(value: any) => {
          setFilters((props: any) => ({
            ...props,
            q: value,
          }));
          setIsModalSearchByTextOpen(false);
        }}
      />
      <ModalCancellation
        isModalOpen={isModalCancellationReasonOpen}
        setIsModalOpen={setIsModalCancellationReasonOpen}
        onSubmit={(e: any) => {
          setItemsSelected([]);
          dispatchSale(
            saleActions.cancelOrders({
              itemsIdSelected: itemsSelected
                .filter((item) => !item.cancelled)
                .map(({ id }) => id),
              reason: e.reason,
              user: e.user,
            })(dispatchSale)
          );
        }}
      />
    </>
  );
};

export default OrdersContainer;
