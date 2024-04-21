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
import dayjs from "dayjs";
import { DatePicker, Select } from "antd";
import {
  darkTheme,
  dateFormat,
  listStore,
  mappingCheckoutDate,
  mappingListStore,
  mappingTypeShipment,
} from "../utils/constants";
import { useTheme } from "../contexts/ThemeContext";

const mappingConceptToUpdate: Record<string, string> = {
  order: "N° Pedido",
  cash: "Efectivo",
  transfer: "Transferencia",
  items: "Prendas",
  total: "Total",
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
  const [filters, setFilters] = useState({
    startDate: formatDateToYYYYMMDD(new Date()),
    endDate: formatDateToYYYYMMDD(new Date()),
    store: user.store === "ALL" ? "" : user.store,
    employee: "",
    typeSale: "pedido",
    typeShipment: "",
    checkoutDate: "",
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

    if (inputType === "date") {
      dispatchSale(
        saleActions.updateOrder({
          dataIndex,
          id,
          value: formatDateToYYYYMMDD(new Date(inputValue)),
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
    setOrdersFiltered(orders);
  }, [orders]);

  return (
    <>
      <div
        className={`h-12 relative p-2 border-x border-t ${themeStyles[theme].tailwindcss.border} flex justify-center`}
      >
        <div className="inline-block">
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
          <label className="ml-1 mr-1">Hasta:</label>

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
          <div className="ml-2 inline-block">
            <label className="mr-1">Sucursal:</label>

            <Select
              value={mappingListStore[filters.store]}
              className={themeStyles[theme].classNameSelector}
              dropdownStyle={themeStyles[theme].dropdownStylesCustom}
              popupClassName={themeStyles[theme].classNameSelectorItem}
              style={{ width: 110 }}
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
        <div className="ml-2 inline-block">
          <label className="mr-1">Vendedor:</label>

          <Select
            value={filters.employee === "" ? "Todos" : filters.employee}
            className={themeStyles[theme].classNameSelector}
            dropdownStyle={themeStyles[theme].dropdownStylesCustom}
            popupClassName={themeStyles[theme].classNameSelectorItem}
            style={{ width: 120 }}
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

        <div className="ml-2 inline-block">
          <label className="mr-1">Tipo:</label>

          <Select
            value={mappingTypeShipment[filters.typeShipment]}
            className={themeStyles[theme].classNameSelector}
            dropdownStyle={themeStyles[theme].dropdownStylesCustom}
            popupClassName={themeStyles[theme].classNameSelectorItem}
            style={{ width: 120 }}
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
        <div className="ml-2 inline-block">
          <label className="mr-1">Salida:</label>

          <Select
            value={mappingCheckoutDate[filters.checkoutDate]}
            className={themeStyles[theme].classNameSelector}
            dropdownStyle={themeStyles[theme].dropdownStylesCustom}
            popupClassName={themeStyles[theme].classNameSelectorItem}
            style={{ width: 120 }}
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

        <div className="ml-2 inline-block">
          <div
            className={`inline-block px-4 py-1 rounded-md border text-white select-none ${
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

      <div
        className={`h-12 relative p-2 border ${themeStyles[theme].tailwindcss.border} flex items-center`}
      >
        <div className="ml-2 inline-block">
          <label className="mr-2">Ordenar:</label>

          <Select
            className={themeStyles[theme].classNameSelector}
            dropdownStyle={themeStyles[theme].dropdownStylesCustom}
            popupClassName={themeStyles[theme].classNameSelectorItem}
            style={{ width: 120 }}
            onSelect={onOrderAscDesc}
            options={[
              { label: "Mayor", value: "higher" },
              { label: "Menor", value: "lower" },
            ]}
          />
        </div>

        {Boolean(itemsIdSelected.length) && (
          <div
            className="w-25 ml-2 bg-red-700 hover:bg-red-800 hover:cursor-pointer text-white px-4 py-1 rounded-md flex items-center justify-center select-none"
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

      <div className="mt-5 h-[74vh] mx-auto max-w overflow-hidden overflow-y-auto overflow-x-auto">
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
