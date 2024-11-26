import { useEffect, useState } from "react";
import { useEmployee } from "../../contexts/EmployeeContext";
import { formatCurrency, formatDateToYYYYMMDD } from "../../utils/formatUtils";
import Spinner from "../../components/Spinner";
import { useUser } from "../../contexts/UserContext";
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
import CrudTable from "../../components/CrudTable";
import { costActions, useCost } from "../../contexts/CostContext";
import { FcApproval } from "react-icons/fc";
import * as XLSX from "xlsx";
import { ModalAccount } from "./ModalAccount";
import { MdOutlineApproval } from "react-icons/md";
import { GiClothes } from "react-icons/gi";

const CostContainer = () => {
  const {
    state: { theme, themeStyles },
  } = useTheme();
  const {
    state: { employees },
  } = useEmployee();
  const {
    state: { loading, costs, accounts },
    dispatch: dispatchCost,
  } = useCost();
  const {
    state: { user },
  } = useUser();

  const [filters, setFilters] = useState({
    startDate: formatDateToYYYYMMDD(new Date()),
    endDate: formatDateToYYYYMMDD(new Date()),
    accounts: [],
    employees: [],
    typeShipment: "",
    checkoutDate: "",
    store: user.store === "ALL" ? "" : user.store,
  });

  const [itemsIdSelected, setItemsIdSelected] = useState<any[]>([]);

  const [editableRow, setEditableRow] = useState<number | null>(null);

  const [isModalAccountOpen, setIsModalAccountOpen] = useState(false);

  const INITIAL_VALUES_COST = {
    id: null,
    date: null,
    account: "",
    numOrder: null,
    amount: "",
    approved: null,
    dateApproved: null,
    employee: "",
    customer: "",
    typeShipment: "",
    checkoutDate: null,
  };

  const [rowValues, setRowValues] = useState(INITIAL_VALUES_COST);

  const columns = [
    { title: "Fecha", dataIndex: "date", editableCell: true, type: "date" },
    {
      title: "Cuenta",
      dataIndex: "account",
      editableCell: true,
      type: "select",
      dataSelect: accounts.map(({ name }: any) => name),
    },
    {
      title: "N°Orden",
      dataIndex: "numOrder",
      editableCell: true,
      type: "number",
    },
    {
      title: "Monto",
      dataIndex: "amount",
      editableCell: true,
      type: "number",
      format: (number: any) => `$${formatCurrency(number)}`,
      sumAcc: user.role === "ADMIN",
      applyFormat: true,
      inputExpanded: true,
    },
    { title: "Sucursal", dataIndex: "store" },
    {
      title: <GiClothes className="w-full" />,
      dataIndex: "items",
      type: "checkbox",
    },
    {
      title: <MdOutlineApproval className="w-full" />,
      dataIndex: "approved",
      type: "checkbox",
      editableCell: true,
      defaultValue: (e: any) =>
        e ? (
          <div className="flex justify-center items-center">
            <FcApproval className="text-2xl" />
          </div>
        ) : (
          "-"
        ),
    },
    {
      title: "Fecha Aprobado",
      dataIndex: "dateApproved",
      editableCell: true,
      type: "date",
    },
    {
      title: "Vendedor",
      dataIndex: "employee",
      editableCell: true,
      type: "select",
      dataSelect: employees
        .filter((e: any) => e.activeForCost)
        .map(({ name }) => name),
    },
    {
      title: "Cliente",
      dataIndex: "customer",
      editableCell: true,
      type: "string",
      inputExpanded: true,
    },
    {
      title: "Tipo",
      dataIndex: "typeShipment",
      editableCell: true,
      type: "select",
      dataSelect: ["retiraLocal", "envio"],
    },
    {
      title: "Salida",
      dataIndex: "checkoutDate",
      editableCell: true,
      type: "date",
    },
  ];

  const handleEditClick = (
    {
      id,
      date,
      account,
      numOrder,
      amount,
      approved,
      dateApproved,
      employee,
      customer,
      typeShipment,
      checkoutDate,
    }: any,
    rowIndex: number
  ) => {
    if (user.role !== "ADMIN") {
      return;
    }

    if (editableRow !== rowIndex) {
      setRowValues({
        id,
        date: id ? date : dayjs(new Date()).format("DD/MM/YYYY"),
        account,
        numOrder,
        amount,
        approved,
        dateApproved,
        employee,
        customer,
        typeShipment,
        checkoutDate,
      });
      setEditableRow(rowIndex);
    }
  };

  const handleAction = ({ dataIndex, inputType, inputValue }: any) => {
    if (inputType === "date") {
      setRowValues((e: any) => ({
        ...e,
        [dataIndex]: dayjs(inputValue).format("DD/MM/YYYY"),
      }));
    }

    if (["string", "number"].includes(inputType)) {
      setRowValues((e: any) => ({
        ...e,
        [dataIndex]: inputValue.target.value,
      }));
    }

    if (inputType === "checkbox") {
      setRowValues((e: any) => ({
        ...e,
        [dataIndex]: inputValue.target.checked,
        dateApproved: dayjs(new Date()).format("DD/MM/YYYY"),
      }));
    }

    if (inputType === "select") {
      setRowValues((e: any) => ({
        ...e,
        [dataIndex]: inputValue.value,
      }));
    }
  };

  const saveRow = () => {
    const actionCost = (values: any) =>
      rowValues.id
        ? costActions.updateCost(values)
        : costActions.addCost(values);

    dispatchCost(actionCost(rowValues)(dispatchCost));
    setRowValues(INITIAL_VALUES_COST);
    setEditableRow(null);
  };

  const costsData = [
    ...costs,
    {
      date: null,
      account: null,
      numOrder: null,
      amount: null,
      approved: null,
      dateApproved: null,
      employee: null,
      customer: null,
      typeShipment: null,
      checkoutDate: null,
    },
  ];

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

    const fileName = `pagos-${formattedDate}-${formattedTime}.xlsx`;

    const formattedData = costs.map((cost: any) => ({
      Fecha: cost.date,
      Cuenta: cost.account,
      "N° Orden": cost.numOrder,
      Monto: `$${formatCurrency(cost.amount)}`,
      Sucursal: cost.store,
      Items: cost.items,
      Aprobado: cost.approved ? "Sí" : "No",
      "Fecha Aprobado": cost.dateApproved,
      Vendedor: cost.employee,
      Cliente: cost.customer || "-",
      Tipo: cost.typeShipment || "-",
      Salida: cost.checkoutDate || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Costs");

    XLSX.writeFile(workbook, fileName);
  };

  const removeCellSelected = () => {
    setRowValues(INITIAL_VALUES_COST);
    setEditableRow(null);
  };

  useEffect(() => {
    dispatchCost(costActions.getAccounts({})(dispatchCost));
  }, []);

  return (
    <>
      <div
        className={`h-12 relative p-2 border-x border-t ${themeStyles[theme].tailwindcss.border} flex`}
        onClick={removeCellSelected}
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
        {user.store === "ALL" && (
          <div className="ml-2 inline-block">
            <label className="mr-1">Sucursal:</label>

            <Select
              value={mappingListStore[filters.store]}
              className={themeStyles[theme].classNameSelector}
              dropdownStyle={themeStyles[theme].dropdownStylesCustom}
              popupClassName={themeStyles[theme].classNameSelectorItem}
              style={{ width: 120 }}
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
      </div>

      <div
        className={`h-[50px] relative p-2 border-x border-t ${themeStyles[theme].tailwindcss.border} flex`}
        onClick={removeCellSelected}
      >
        <div className="inline-block">
          <label className="mr-1">Cuenta:</label>

          <Select
            mode="multiple"
            value={filters.accounts.length ? filters.accounts : ["Todos"]}
            className={themeStyles[theme].classNameSelector}
            dropdownStyle={themeStyles[theme].dropdownStylesCustom}
            popupClassName={themeStyles[theme].classNameSelectorItem}
            style={{
              width: "350px",
            }}
            onSelect={(value: any) =>
              setFilters((props: any) => ({
                ...props,
                accounts: value.length
                  ? props.accounts.includes(value)
                    ? props.accounts.filter((account: any) => account !== value)
                    : [...props.accounts, value]
                  : [],
              }))
            }
            onDeselect={(value: any) =>
              setFilters((props: any) => ({
                ...props,
                accounts: props.accounts.filter(
                  (account: any) => account !== value
                ),
              }))
            }
            options={[
              { label: "Todos", value: "" },
              ...accounts.map((data: any) => ({
                value: data.name,
                label: data.name,
              })),
            ]}
          />
        </div>

        <div className="ml-2 inline-block">
          <label className="mr-1">Vendedor:</label>

          <Select
            mode="multiple"
            value={filters.employees.length ? filters.employees : ["Todos"]}
            className={themeStyles[theme].classNameSelector}
            dropdownStyle={themeStyles[theme].dropdownStylesCustom}
            popupClassName={themeStyles[theme].classNameSelectorItem}
            style={{
              width: "350px",
            }}
            onSelect={(value: any) =>
              setFilters((props: any) => ({
                ...props,
                employees: value.length
                  ? props.employees.includes(value)
                    ? props.employees.filter(
                        (employee: any) => employee !== value
                      )
                    : [...props.employees, value]
                  : [],
              }))
            }
            onDeselect={(value: any) =>
              setFilters((props: any) => ({
                ...props,
                employees: props.employees.filter(
                  (employee: any) => employee !== value
                ),
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
          <div
            className={`inline-block px-4 py-1 rounded-md border text-white select-none ${
              Boolean(filters.startDate.length) &&
              Boolean(filters.endDate.length) &&
              "bg-[#1b78e2] border-[#1b78e2] hover:cursor-pointer hover:opacity-80 transition-opacity"
            } flex items-center mx-auto`}
            onClick={() =>
              !loading &&
              dispatchCost(costActions.getCosts(filters)(dispatchCost))
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

        <Tag color="#3B3B3B" className="ml-2 py-1 px-2 text-sm">
          Cantidad Gastos: {costs.length}
        </Tag>

        <div className="inline-block">
          <div
            className=" ml-2 bg-green-800 hover:bg-green-900 hover:cursor-pointer text-white px-2  py-1 rounded-md flex items-center justify-center select-none"
            onClick={downloadExcel}
          >
            Excel
          </div>
        </div>

        <div className="inline-block">
          <div
            className=" ml-2 bg-pink-700 hover:bg-pink-800 hover:cursor-pointer text-white px-2  py-1 rounded-md flex items-center justify-center select-none"
            onClick={() => setIsModalAccountOpen(true)}
          >
            Cuentas
          </div>
        </div>

        <div className="ml-2 inline-block">
          {Boolean(itemsIdSelected.length) && (
            <div
              className=" ml-2 bg-red-700 hover:bg-red-800 hover:cursor-pointer text-white px-2  py-1 rounded-md flex items-center justify-center select-none"
              onClick={() => {
                dispatchCost(
                  costActions.removeCosts({
                    costsIds: itemsIdSelected,
                  })(dispatchCost)
                );
                setItemsIdSelected([]);
              }}
            >
              Eliminar Items
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 h-[74vh] mx-auto max-w overflow-hidden overflow-y-auto overflow-x-auto">
        <CrudTable
          data={costsData}
          columns={columns}
          handleAction={handleAction}
          editableRow={editableRow}
          handleEditClick={handleEditClick}
          itemsIdSelected={itemsIdSelected}
          setItemsIdSelected={setItemsIdSelected}
          enableSelectItem={true}
          withActionButton={true}
          rowValues={rowValues}
          saveRow={saveRow}
        />
      </div>

      <ModalAccount
        isModalOpen={isModalAccountOpen}
        setIsModaOpen={setIsModalAccountOpen}
      />
    </>
  );
};

export default CostContainer;
