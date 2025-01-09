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
  mappingApproved,
} from "../../utils/constants";
import { useTheme } from "../../contexts/ThemeContext";
import CrudTable from "../../components/CrudTable";
import { costActions, useCost } from "../../contexts/CostContext";
import { FcApproval } from "react-icons/fc";
import * as XLSX from "xlsx";
import { ModalAccount } from "./ModalAccount";
import { MdCleaningServices, MdOutlineApproval } from "react-icons/md";
import { GiClothes } from "react-icons/gi";
import { PiLinkBold, PiLink, PiLinkBreak } from "react-icons/pi";
import { ModalConfirmDelete } from "./ModalConfirmDelete";

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
    approved: "",
    store: user.store === "ALL" ? "" : user.store,
    q: "",
  });

  const [itemsIdSelected, setItemsIdSelected] = useState<any[]>([]);

  const [editableRow, setEditableRow] = useState<number | null>(null);

  const [isModalAccountOpen, setIsModalAccountOpen] = useState(false);
  const [isModalConfirmDeleteOpen, setIsModalConfirmDeleteOpen] =
    useState(false);

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
    {
      title: "Fecha",
      dataIndex: "date",
      editableCell: user.role === "ADMIN",
      type: "date",
    },
    {
      title: "Cuenta",
      dataIndex: "account",
      editableCell: user.role === "ADMIN",
      type: "select",
      dataSelect: accounts.map(({ name }: any) => ({
        value: name,
        label: name,
      })),
    },
    {
      title: "N°Orden",
      dataIndex: "numOrder",
      editableCell: user.role === "ADMIN",
      type: "number",
    },
    {
      title: <PiLinkBold className="w-full" />,
      dataIndex: "linkedOnOrder",
      customStyles: "w-[30px]",
      defaultValue: (e: any) =>
        e === "-" ? (
          "-"
        ) : (
          <div className="flex justify-center items-center">
            {e ? (
              <PiLink className="text-2xl" />
            ) : (
              <PiLinkBreak className="text-2xl" />
            )}
          </div>
        ),
    },
    {
      title: "Monto",
      dataIndex: "amount",
      editableCell: user.role === "ADMIN",
      type: "currency",
      sumAcc: user.role === "ADMIN",
      applyFormat: true,
      inputExpanded: true,
      defaultValue: (e: any, row: any) => {
        return e === "-" || e === null ? (
          "-"
        ) : (
          <div
            className={`${row.backgroundColor} ${row.textColor} p-1 rounded-md`}
          >
            ${formatCurrency(e)}
          </div>
        );
      },
    },
    { title: "Sucursal", dataIndex: "store" },
    {
      title: <GiClothes className="w-full" />,
      dataIndex: "items",
      type: "checkbox",
      sumAcc: true,
    },
    {
      title: <MdOutlineApproval className="w-full" />,
      dataIndex: "approved",
      type: "checkbox",
      customStyles: "w-[30px]",
      editableCell: user.role === "ADMIN",
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
      editableCell: user.role === "ADMIN",
      type: "date",
    },
    {
      title: "Vendedor",
      dataIndex: "employee",
      editableCell: user.role === "ADMIN",
      type: "select",
      dataSelect: employees
        .filter((e: any) => e.activeForCost)
        .map(({ name }) => ({
          value: name,
          label: name,
        })),
    },
    {
      title: "Cliente",
      dataIndex: "customer",
      editableCell: user.role === "ADMIN",
      customStyles: "w-[250px]",
      type: "string",
      inputExpanded: true,
    },
    {
      title: "Tipo",
      dataIndex: "typeShipment",
      editableCell: true,
      enableClean: true,
      type: "select",
      dataSelect: [
        {
          label: (
            <div className="bg-green-100 text-green-700 px-1 rounded-md">
              Envio
            </div>
          ),
          value: "envio",
        },
        {
          label: (
            <div className="bg-yellow-100 text-yellow-700 px-1 rounded-md">
              Retira local
            </div>
          ),
          value: "retiraLocal",
        },
        {
          label: (
            <div className="bg-red-100 text-red-700 px-1 rounded-md">NRL</div>
          ),
          value: "nrl",
        },
      ],

      defaultValue: (e: any) =>
        e === "-" ? (
          "-"
        ) : (
          <div className="flex justify-center items-center">
            {e === "envio" && (
              <div className="w-full bg-green-100 text-green-700 p-1 rounded-md">
                Envio
              </div>
            )}
            {e === "retiraLocal" && (
              <div className="w-full bg-yellow-100 text-yellow-700 p-1 rounded-md">
                Retira local
              </div>
            )}
            {e === "nrl" && (
              <div className="w-full bg-red-100 text-red-700 p-1 rounded-md">
                NRL
              </div>
            )}
          </div>
        ),
    },
    {
      title: "Salida",
      dataIndex: "checkoutDate",
      editableCell: true,
      enableClean: true,
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

  const saveRow = (customValues: any) => {
    const dataValues = customValues ?? rowValues;
    const actionCost = (values: any) =>
      dataValues.id
        ? costActions.updateCost(values)
        : costActions.addCost(values);

    dispatchCost(actionCost(dataValues)(dispatchCost));
    setRowValues(INITIAL_VALUES_COST);
    setEditableRow(null);
  };

  const handleAction = ({ dataIndex, inputType, inputValue }: any) => {
    if (inputType === "date") {
      setRowValues((e: any) => ({
        ...e,
        [dataIndex]: dayjs(inputValue).format("DD/MM/YYYY"),
      }));

      saveRow({
        ...rowValues,
        [dataIndex]: dayjs(inputValue).format("DD/MM/YYYY"),
      });
    }

    if (["currency"].includes(inputType)) {
      setRowValues((e: any) => ({
        ...e,
        [dataIndex]: inputValue.target.value,
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

  const handleClean = ({ dataIndex }: any) => {
    setRowValues((e: any) => ({
      ...e,
      [dataIndex]: null,
    }));
    saveRow({
      ...rowValues,
      [dataIndex]: null,
    });
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
      linkedOnOrder: "-",
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
        className={`h-12 relative p-2 border-x border-t ${themeStyles[theme].tailwindcss.border} flex justify-between items-center`}
        onClick={removeCellSelected}
      >
        <div className={`flex space-between`} onClick={removeCellSelected}>
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
                {
                  label: (
                    <div className="bg-green-100 text-green-700 p-1 rounded-md">
                      Envio
                    </div>
                  ),
                  value: "envio",
                },
                {
                  label: (
                    <div className="bg-yellow-100 text-yellow-700 p-1 rounded-md">
                      Retira local
                    </div>
                  ),
                  value: "retiraLocal",
                },
                {
                  label: (
                    <div className="bg-red-100 text-red-700 p-1 rounded-md">
                      NRL
                    </div>
                  ),
                  value: "nrl",
                },
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
            <label className="mr-1">Aprobado:</label>

            <Select
              value={mappingApproved[filters.approved]}
              className={themeStyles[theme].classNameSelector}
              dropdownStyle={themeStyles[theme].dropdownStylesCustom}
              popupClassName={themeStyles[theme].classNameSelectorItem}
              style={{ width: 120 }}
              onSelect={(value: any) =>
                setFilters((props) => ({
                  ...props,
                  approved: value,
                }))
              }
              options={[
                { label: "Todos", value: "" },
                { label: "Aprobado", value: "approved" },
                { label: "Sin Aprobar", value: "withoutApproved" },
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
                onClick={() =>
                  !loading &&
                  dispatchCost(costActions.getCosts(filters)(dispatchCost))
                }
                options={listStore.map((data: any) => ({
                  value: data.value === "ALL" ? "" : data.value,
                  label: data.name,
                }))}
              />
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center">
            <FcApproval className="text-2xl mr-1" />
            <DatePicker
              onChange={(date: any) =>
                !loading &&
                dispatchCost(
                  costActions.getCostsByDateApproved({
                    dateApproved: date.format("YYYY-MM-DD"),
                    store: user.store === "ALL" ? "" : user.store,
                  })(dispatchCost)
                )
              }
              className={themeStyles[theme].datePickerIndicator}
              style={themeStyles[theme].datePicker}
              popupClassName={themeStyles[theme].classNameDatePicker}
              allowClear={false}
              format={dateFormat}
              defaultValue={dayjs(new Date())}
            />
          </div>
        </div>
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
              width: "200px",
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
              width: "200px",
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
          <div className="flex items-center space-x-1">
            <input
              type="text"
              className={`w-[150px] p-1 border-2 border-[#1BA1E2] rounded-md text-center hover:cursor-pointer ${themeStyles[theme].tailwindcss.inputText}`}
              value={filters.q}
              placeholder="Texto"
              onChange={(value: any) => {
                setFilters((props: any) => ({
                  ...props,
                  q: value.target.value,
                }));
              }}
            />
            <div
              className="bg-gray-700 w-5 text-white py-1 rounded-md flex items-center justify-center select-none transition-opacity duration-200 hover:opacity-80 active:scale-95"
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
          Cantidad Tickets: {costs.length}
        </Tag>

        <div className="inline-block">
          <div
            className=" ml-2 bg-green-800 hover:bg-green-900 hover:cursor-pointer text-white px-2  py-1 rounded-md flex items-center justify-center select-none"
            onClick={downloadExcel}
          >
            Excel
          </div>
        </div>

        {user.store === "ALL" && (
          <div className="inline-block">
            <div
              className=" ml-2 bg-pink-700 hover:bg-pink-800 hover:cursor-pointer text-white px-2  py-1 rounded-md flex items-center justify-center select-none"
              onClick={() => setIsModalAccountOpen(true)}
            >
              Cuentas
            </div>
          </div>
        )}

        <div className="ml-2 inline-block">
          {Boolean(itemsIdSelected.length) && (
            <div
              className=" ml-2 bg-red-700 hover:bg-red-800 hover:cursor-pointer text-white px-2  py-1 rounded-md flex items-center justify-center select-none"
              onClick={() => setIsModalConfirmDeleteOpen(true)}
            >
              Eliminar Items
            </div>
          )}
        </div>

        <div className="ml-2 inline-block">
          {Boolean(itemsIdSelected.length) && (
            <Select
              value="Asignar Color"
              className={themeStyles[theme].classNameSelector}
              dropdownStyle={themeStyles[theme].dropdownStylesCustom}
              popupClassName={themeStyles[theme].classNameSelectorItem}
              style={{ width: 150 }}
              onSelect={(value: any) => {
                const mappingObjColor: any = {
                  "": {
                    backgroundColor: "",
                    textColor: "",
                    color: "",
                  },
                  green: {
                    backgroundColor: "bg-green-100",
                    textColor: "text-green-700",
                    color: "green",
                  },
                  yellow: {
                    backgroundColor: "bg-yellow-100",
                    textColor: "text-yellow-700",
                    color: "yellow",
                  },
                  red: {
                    backgroundColor: "bg-red-100",
                    textColor: "text-red-700",
                    color: "red",
                  },
                  blue: {
                    backgroundColor: "bg-blue-100",
                    textColor: "text-blue-700",
                    color: "blue",
                  },
                };
                dispatchCost(
                  costActions.updateColorCost({
                    costsIds: itemsIdSelected,
                    backgroundColor: mappingObjColor[value].backgroundColor,
                    textColor: mappingObjColor[value].textColor,
                    color: mappingObjColor[value].color,
                  })(dispatchCost)
                );
                setItemsIdSelected([]);
              }}
              options={[
                {
                  label: "Sin Color",
                  value: "",
                },
                {
                  label: (
                    <div className="bg-green-100 text-green-700 p-1 rounded-md">
                      Verde
                    </div>
                  ),
                  value: "green",
                },
                {
                  label: (
                    <div className="bg-yellow-100 text-yellow-700 p-1 rounded-md">
                      Amarillo
                    </div>
                  ),
                  value: "yellow",
                },
                {
                  label: (
                    <div className="bg-red-100 text-red-700 p-1 rounded-md">
                      Rojo
                    </div>
                  ),
                  value: "red",
                },
                {
                  label: (
                    <div className="bg-blue-100 text-blue-700 p-1 rounded-md">
                      Azul
                    </div>
                  ),
                  value: "blue",
                },
              ]}
            />
          )}
        </div>
      </div>

      <div className="mt-5 h-[74vh] mx-auto max-w overflow-hidden overflow-y-auto overflow-x-auto">
        <CrudTable
          data={costsData}
          columns={columns}
          handleAction={handleAction}
          handleClean={handleClean}
          editableRow={editableRow}
          handleEditClick={handleEditClick}
          itemsIdSelected={itemsIdSelected}
          setItemsIdSelected={setItemsIdSelected}
          enableSelectItem={user.role === "ADMIN"}
          withActionButton={true}
          rowValues={rowValues}
          saveRow={saveRow}
          onEnterPress={() => {
            console.log("Enter pressed on row:");
          }}
        />
      </div>

      <ModalAccount
        isModalOpen={isModalAccountOpen}
        setIsModaOpen={setIsModalAccountOpen}
      />
      <ModalConfirmDelete
        isModalOpen={isModalConfirmDeleteOpen}
        setIsModaOpen={setIsModalConfirmDeleteOpen}
        handleAction={() => {
          dispatchCost(
            costActions.removeCosts({
              costsIds: itemsIdSelected,
            })(dispatchCost)
          );
          setItemsIdSelected([]);
          setIsModalConfirmDeleteOpen(false);
        }}
      />
    </>
  );
};

export default CostContainer;
