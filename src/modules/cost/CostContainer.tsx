import { useState } from "react";
import { useEmployee } from "../../contexts/EmployeeContext";
import { formatCurrency, formatDateToYYYYMMDD } from "../../utils/formatUtils";
import Spinner from "../../components/Spinner";
import { useUser } from "../../contexts/UserContext";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { dateFormat } from "../../utils/constants";
import { useTheme } from "../../contexts/ThemeContext";
import CrudTable from "../../components/CrudTable";
import { costActions, useCost } from "../../contexts/CostContext";
import { BsHandThumbsUp, BsHandThumbsDown } from "react-icons/bs";

const CostContainer = () => {
  const {
    state: { theme, themeStyles },
  } = useTheme();
  const {
    state: { employees },
  } = useEmployee();
  const {
    state: { loading, costs },
    dispatch: dispatchCost,
  } = useCost();
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

  const [itemsIdSelected, setItemsIdSelected] = useState<any[]>([]);

  const [editableRow, setEditableRow] = useState<number | null>(null);

  const INITIAL_VALUES_COST = {
    id: null,
    date: null,
    account: "",
    amount: "",
    approved: true,
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
      type: "string",
    },
    {
      title: "Monto",
      dataIndex: "amount",
      editableCell: true,
      type: "number",
      format: (number: any) => `$${formatCurrency(number)}`,
      applyFormat: true,
    },
    {
      title: "Aprobado",
      dataIndex: "approved",
      type: "checkbox",
      editableCell: true,
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
      dataSelect: employees.map(({ name }) => name),
    },
    {
      title: "Cliente",
      dataIndex: "customer",
      editableCell: true,
      type: "string",
    },
    {
      title: "Tipo",
      dataIndex: "typeShipment",
      editableCell: true,
      type: "select",
      dataSelect: ["retiraLocal", "envio"],
    },
    /*{
      title: <MdOutlinePendingActions />,
      defaultValue: <MdOutlinePendingActions />,
      dataIndex: "checkoutDate",
      editableCell: true,
      type: "button",
    },*/
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
    if (editableRow !== rowIndex) {
      //Para que cuando se seleccione el row no altere los valores
      setRowValues({
        id,
        date,
        account,
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
      }));
    }

    if (inputType === "select") {
      setRowValues((e: any) => ({
        ...e,
        [dataIndex]: inputValue.value,
      }));
    }
  };

  //console.log(rowValues);

  const saveRow = (e: any) => {
    const actionCost = (values: any) =>
      rowValues.id
        ? costActions.updateCost(values)
        : costActions.addCost(values);

    dispatchCost(actionCost(rowValues)(dispatchCost));
    setRowValues(INITIAL_VALUES_COST);
    setEditableRow(null);
  };

  const costsData = [
    ...costs.map((cost: any) => ({
      ...cost,
      approved: cost.approved ? <BsHandThumbsUp /> : <BsHandThumbsDown />,
    })),
    {
      date: null,
      account: null,
      amount: null,
      approved: null,
      dateApproved: null,
      employee: null,
      customer: null,
      typeShipment: null,
      checkoutDate: null,
    },
  ];

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
    </>
  );
};

export default CostContainer;
