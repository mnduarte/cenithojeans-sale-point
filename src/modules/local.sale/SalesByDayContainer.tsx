import { useEffect, useState } from "react";
import { saleActions, useSale } from "../../contexts/SaleContext";
import { useUser } from "../../contexts/UserContext";
import { cashflowActions, useCashflow } from "../../contexts/CashflowContext";
import { useTheme } from "../../contexts/ThemeContext";
import { formatCurrency, formatDateToYYYYMMDD } from "../../utils/formatUtils";
import { dateFormat, listStore, mappingListStore } from "../../utils/constants";
import { PDFDownloadLink } from "@react-pdf/renderer";
import dayjs from "dayjs";
import { DatePicker, Select, Tag } from "antd";

import { MdClose } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { GrPowerReset } from "react-icons/gr";
import Spinner from "../../components/Spinner";
import KeyboardNum from "../../components/KeyboardNum";
import Toast from "../../components/Toast";
import EditableTable from "../../components/EditableTable";
import NewRowSale from "./NewRowSale";
import NewNumOrder from "./NewNumOrder";

import TableSaleByDay from "./TableSaleByDay";
import Keyboard from "../../components/Keyboard";

import PdfLocalSale from "./PdfLocalSale";
import PdfLocalTransfer from "./PdfLocalTransfer";

const mappingConceptToUpdate: Record<string, string> = {
  cash: "Efectivo",
  transfer: "Transferencia",
  items: "Prendas",
  total: "Total",
};

const ModalListOutgoing = ({
  isModalListOutgoingOpen,
  setIsModalListOutgoingOpen,
  date,
  outgoings = [],
}: any) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();
  const [itemsIdSelected, setItemsIdSelected] = useState<any[]>([]);
  const [editableRow, setEditableRow] = useState<number | null>(null);
  const [isModalKeyboardNumOpen, setIsModalKeyboardNumOpen] = useState(false);
  const [value, setValue] = useState(0);
  const [propSale, setPropSale] = useState({
    id: "",
    dataIndex: "",
  });

  const {
    state: { loading },
    dispatch: dispatchCashflow,
  } = useCashflow();

  const columns = [
    {
      title: "Detalle",
      dataIndex: "description",
      type: "string",
    },
    {
      title: "Importe",
      dataIndex: "amount",
      editableCell: true,
      type: "string",
      format: (number: any) => `$${formatCurrency(number)}`,
      applyFormat: true,
      sumAcc: true,
    },
  ];

  const handleManualValue = (item: any) => {
    if (item.action === "deleteLast") {
      return setValue((currentValue: any) =>
        Number(String(currentValue).slice(0, -1))
      );
    }

    if (item.action === "addPrice") {
      dispatchCashflow(
        cashflowActions.updateCashflow({ ...propSale, value })(dispatchCashflow)
      );
      setValue(0);
      setEditableRow(null);
      return setIsModalKeyboardNumOpen(false);
    }

    setValue((currentValue: any) =>
      Number(String(currentValue) + String(item.value))
    );
  };

  const handleAction = ({ dataIndex, value, id, inputType }: any) => {
    if (inputType === "string") {
      setPropSale({ dataIndex, id });
      setValue(value ? value : 0);
      setIsModalKeyboardNumOpen(true);
    }
  };

  return (
    <>
      {isModalListOutgoingOpen && (
        <div className="fixed inset-0 bg-[#252525] bg-opacity-60 flex items-center justify-center">
          {/* Contenido del modal */}
          <div
            className={`w-[65vh] h-[60vh] p-8 rounded-md shadow-md relative ${themeStyles[theme].tailwindcss.modal}`}
          >
            {/* Icono de cerrar en la esquina superior derecha */}
            <button
              className="absolute top-4 right-4"
              onClick={() => setIsModalListOutgoingOpen(false)}
            >
              <MdClose className="text-2xl" />
            </button>

            <h2 className="text-lg font-bold mb-4">
              Listado de Egresos - {date}
            </h2>
            {Boolean(itemsIdSelected.length) && (
              <div
                className="w-15 ml-2 bg-red-700 hover:bg-red-800 hover:cursor-pointer text-white px-4 py-1 rounded-md flex items-center justify-center select-none"
                onClick={() => {
                  setItemsIdSelected([]);
                  dispatchCashflow(
                    cashflowActions.removeCashflows({
                      cashflowIds: itemsIdSelected,
                    })(dispatchCashflow)
                  );
                }}
              >
                Eliminar Items Seleccionados
              </div>
            )}
            <div className="mt-5 h-[43vh] mx-auto max-w overflow-hidden overflow-y-auto overflow-x-auto">
              <EditableTable
                data={outgoings}
                columns={columns}
                handleAction={handleAction}
                editableRow={editableRow}
                handleEditClick={(rowIndex: number) => {
                  setEditableRow(rowIndex);
                }}
                itemsIdSelected={itemsIdSelected}
                setItemsIdSelected={setItemsIdSelected}
                enableSelectItem={true}
              />

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
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ModalListTranferSale = ({
  isModalListTransferSaleOpen,
  setIsModalListTransferSaleOpen,
  date,
  store,
  sales = [],
}: any) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();
  const {
    state: { user },
  } = useUser();
  const [itemsIdSelected, setItemsIdSelected] = useState<any[]>([]);
  const [editableRow, setEditableRow] = useState<number | null>(null);
  const [isModalKeyboardNumOpen, setIsModalKeyboardNumOpen] = useState(false);
  const [cashflowIdSelected, setCashflowIdSelected] = useState<any[]>([]);
  const [value, setValue] = useState(0);
  const [propSale, setPropSale] = useState({
    id: "",
    dataIndex: "",
  });

  const {
    state: { loading },
    dispatch: dispatchSale,
  } = useSale();

  const columns = [
    { title: "N°", dataIndex: "order", size: "w-5" },
    { title: "Vendedor", dataIndex: "employee" },
    {
      title: "Efectivo",
      dataIndex: "cash",
      editableCell: true,
      type: "string",
      format: (number: any) => `$${formatCurrency(number)}`,
      applyFormat: true,
      sumAcc: user.role === "ADMIN",
    },
    {
      title: "Transferencia",
      dataIndex: "transfer",
      editableCell: true,
      type: "string",
      format: (number: any) => `$${formatCurrency(number)}`,
      applyFormat: true,
      sumAcc: user.role === "ADMIN",
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
      applyFormat: true,
      sumAcc: user.role === "ADMIN",
    },
  ];

  const handleManualValue = (item: any) => {
    if (item.action === "deleteLast") {
      return setValue((currentValue: any) =>
        Number(String(currentValue).slice(0, -1))
      );
    }

    if (item.action === "addPrice") {
      dispatchSale(
        saleActions.updateSaleByEmployee({ ...propSale, value })(dispatchSale)
      );
      setValue(0);
      setEditableRow(null);
      return setIsModalKeyboardNumOpen(false);
    }

    setValue((currentValue: any) =>
      Number(String(currentValue) + String(item.value))
    );
  };

  const handleAction = ({ dataIndex, value, id, inputType }: any) => {
    if (inputType === "string") {
      setPropSale({ dataIndex, id });
      setValue(value ? value : 0);
      setIsModalKeyboardNumOpen(true);
    }
  };

  const handleItemsSelected = (row: any, checked: any) => {
    const setIdsSelected =
      row.type === "ingreso" ? setCashflowIdSelected : setItemsIdSelected;

    setIdsSelected((items: any) => {
      if (checked) {
        return [...items, { id: row.id }];
      }

      return items.filter((i: any) => i.id !== row.id);
    });
  };

  return (
    <>
      {isModalListTransferSaleOpen && (
        <div className="fixed inset-0 bg-[#252525] bg-opacity-60 flex items-center justify-center">
          {/* Contenido del modal */}
          <div
            className={`w-[70vh] h-[65vh] p-8 rounded-md shadow-md relative ${themeStyles[theme].tailwindcss.modal}`}
          >
            {/* Icono de cerrar en la esquina superior derecha */}
            <button
              className="absolute top-4 right-4"
              onClick={() => setIsModalListTransferSaleOpen(false)}
            >
              <MdClose className="text-2xl" />
            </button>

            <h2 className="text-lg font-bold mb-4">
              Listado de Transferencias - {date}
            </h2>

            <div className="mt-2 h-[4vh] mx-auto max-w flex items-center">
              <PDFDownloadLink
                document={
                  <PdfLocalTransfer
                    date={dayjs(date).format("DD-MM-YYYY")}
                    store={mappingListStore[store]}
                    data={sales}
                  />
                }
                fileName={`listado-transferencias-${dayjs(date).format(
                  "DD-MM-YYYY"
                )}.pdf`}
                className="w-25 ml-2 bg-cyan-700 hover:bg-green-800 hover:cursor-pointer text-white px-4 py-1 rounded-md flex items-center justify-center select-none"
              >
                {({ loading, url, error, blob }) =>
                  loading ? (
                    <button>Cargando Documento ...</button>
                  ) : (
                    <button>Generar PDF</button>
                  )
                }
              </PDFDownloadLink>

              {(Boolean(itemsIdSelected.length) ||
                Boolean(cashflowIdSelected.length)) && (
                <div
                  className=" ml-2 bg-red-700 hover:bg-red-800 hover:cursor-pointer text-white px-4 py-1 rounded-md flex items-center justify-center select-none"
                  onClick={() => {
                    dispatchSale(
                      saleActions.removeSales({
                        salesIds: itemsIdSelected,
                        cashflowIds: cashflowIdSelected,
                      })(dispatchSale)
                    );
                    setItemsIdSelected([]);
                    setCashflowIdSelected([]);
                  }}
                >
                  Eliminar Items Seleccionados
                </div>
              )}
            </div>

            <div className="mt-2 h-[50vh] mx-auto max-w overflow-hidden overflow-y-auto overflow-x-auto">
              <EditableTable
                data={sales}
                columns={columns}
                handleAction={handleAction}
                editableRow={editableRow}
                handleEditClick={(rowIndex: number) => {
                  setEditableRow(rowIndex);
                }}
                itemsIdSelected={itemsIdSelected}
                cashflowIdSelected={cashflowIdSelected}
                setItemsIdSelected={setItemsIdSelected}
                setCashflowIdSelected={setCashflowIdSelected}
                enableSelectItem={true}
              />

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
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ModalSaleDetail = ({
  isModalSaleDetailOpen,
  setIsModalSaleDetailOpen,
  sale,
}: any) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();
  const {
    state: { user },
  } = useUser();

  const [description, setDescription] = useState("");
  const [editableRow, setEditableRow] = useState<number | null>(null);
  const [isModalKeyboardNumOpen, setIsModalKeyboardNumOpen] = useState(false);
  const [value, setValue] = useState(0);
  const [propSale, setPropSale] = useState({
    id: "",
    dataIndex: "",
  });

  const {
    state: { loading },
    dispatch: dispatchSale,
  } = useSale();

  const columns = [
    {
      title: "Efectivo",
      dataIndex: "cash",
      editableCell: true,
      type: "string",
      format: (number: any) => `$${formatCurrency(number)}`,
      applyFormat: true,
    },
    {
      title: "Transferencia",
      dataIndex: "transfer",
      editableCell: true,
      type: "string",
      format: (number: any) => `$${formatCurrency(number)}`,
      applyFormat: true,
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
      applyFormat: true,
    },
  ];

  const handleManualValue = (item: any) => {
    if (item.action === "deleteLast") {
      return setValue((currentValue: any) =>
        Number(String(currentValue).slice(0, -1))
      );
    }

    if (item.action === "addPrice") {
      dispatchSale(
        saleActions.updateSaleByEmployee({ ...propSale, value })(dispatchSale)
      );
      setValue(0);
      setEditableRow(null);
      return setIsModalKeyboardNumOpen(false);
    }

    setValue((currentValue: any) =>
      Number(String(currentValue) + String(item.value))
    );
  };

  const handleAction = ({ dataIndex, value, id, inputType }: any) => {
    if (inputType === "string") {
      setPropSale({ dataIndex, id });
      setValue(value ? value : 0);
      setIsModalKeyboardNumOpen(true);
    }
  };

  useEffect(() => {
    if (sale && sale.description) {
      setDescription(sale.description);
    }
  }, []);

  return (
    <>
      {isModalSaleDetailOpen && (
        <div className="fixed inset-0 bg-[#252525] bg-opacity-60 flex items-center justify-center">
          {/* Contenido del modal */}
          <div
            className={`w-[65vh] h-[60vh] p-8 rounded-md shadow-md relative ${themeStyles[theme].tailwindcss.modal}`}
          >
            {/* Icono de cerrar en la esquina superior derecha */}
            <button
              className="absolute top-4 right-4"
              onClick={() => setIsModalSaleDetailOpen(false)}
            >
              <MdClose className="text-2xl" />
            </button>

            <h2 className="text-lg font-bold mb-4">{sale.employee}</h2>
            <div className="mt-5 h-[74vh] mx-auto max-w overflow-hidden overflow-y-auto overflow-x-auto">
              <EditableTable
                data={[sale]}
                columns={columns}
                handleAction={handleAction}
                editableRow={editableRow}
                handleEditClick={(rowIndex: number) => {
                  setEditableRow(rowIndex);
                }}
                itemsIdSelected={[]}
                setItemsIdSelected={() => {}}
              />

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
              <div className="mb-2">
                <label className="mb-2 h-[5vh] flex items-center justify-start">
                  Comentario:
                </label>
                <input
                  type="text"
                  value={description}
                  readOnly
                  className={`w-[56vh] p-2 rounded-md mr-2 ${themeStyles[theme].tailwindcss.inputText}`}
                />
              </div>

              <div className="flex items-center justify-center">
                <Keyboard
                  onKeyPress={(e: any) => {
                    let newDescription = description;

                    if (e.action === "deleteLast") {
                      newDescription = newDescription.slice(0, -1);
                    }

                    if (e.action === "addSpace") {
                      newDescription = newDescription + " ";
                    }

                    if (!e.action) {
                      newDescription = newDescription + e.value.toLowerCase();
                    }

                    setDescription(newDescription);
                  }}
                />
              </div>
              <br />

              <div className="flex space-x-4">
                <div
                  className="w-1/2 bg-blue-800 hover:bg-blue-800 hover:cursor-pointer text-white px-4 py-2 rounded-md flex items-center justify-center mx-auto select-none"
                  onClick={() => setIsModalSaleDetailOpen(false)}
                >
                  Cancelar
                </div>
                <div
                  className={`${
                    !Boolean(description.length)
                      ? "bg-gray-500"
                      : "bg-green-800 hover:bg-green-800 hover:cursor-pointer"
                  }  w-1/2 text-white px-4 py-2 rounded-md flex items-center justify-center mx-auto select-none `}
                  onClick={() =>
                    Boolean(description.length) &&
                    dispatchSale(
                      saleActions.updateSaleByEmployee({
                        id: sale.id,
                        dataIndex: "description",
                        value: description,
                      })(dispatchSale)
                    )
                  }
                >
                  Guardar Comentario
                  {loading && (
                    <div className="ml-2">
                      <Spinner />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const SalesByDayContainer = () => {
  const {
    state: { theme, themeStyles },
  } = useTheme();

  const {
    state: {
      salesByEmployees,
      salesTransferByEmployees,
      loading,
      showSuccessToast,
      showErrorToast,
      showSuccessToastMsg,
      lastSaleUpdated,
    },
    dispatch: dispatchSale,
  } = useSale();
  const {
    state: { user },
  } = useUser();

  let timeoutId: ReturnType<typeof setTimeout>;

  const {
    state: { loading: loadingCashflow, incomes, outgoings },
    dispatch: dispatchCashflow,
  } = useCashflow();
  const [date, setDate] = useState(formatDateToYYYYMMDD(new Date()));
  const [store, setStore] = useState(user.store);
  const [value, setValue] = useState(0);
  const [propSale, setPropSale] = useState({
    id: "",
    dataIndex: "",
  });
  const [isModalKeyboardNumOpen, setIsModalKeyboardNumOpen] = useState(false);
  const [isModalSaleDetailOpen, setIsModalSaleDetailOpen] = useState(false);
  const [isModalListTranferSaleOpen, setIsModalListTranferSaleOpen] =
    useState(false);
  const [isModalListOutgoingOpen, setIsModalListOutgoingOpen] = useState(false);
  const [isModalNewRowSale, setIsModalNewRowSale] = useState(false);
  const [isModalNewNumOrder, setIsModalNewNumOrder] = useState(false);
  const [showToastDetailSale, setShowToastDetailSale] = useState(false);
  const [itemsIdSelected, setItemsIdSelected] = useState<any[]>([]);
  const [cashflowIdSelected, setCashflowIdSelected] = useState<any[]>([]);

  const [editableRow, setEditableRow] = useState<number | null>(null);
  const [employeeSelectedForNewRowSale, setEmployeeSelectedForNewRowSale] =
    useState("");

  const [totals, setTotals] = useState({
    items: 0,
    cash: 0,
    transfer: 0,
    outgoing: 0,
  });

  const columns = [
    { title: "N°", dataIndex: "order", size: "w-5" },
    {
      title: "Pren",
      dataIndex: "items",
      editableCell: true,
      type: "string",
      sumAcc: true,
    },
    {
      title: "Cash",
      dataIndex: "cash",
      format: (number: any) => `$${formatCurrency(number)}`,
      notZero: true,
      defaultValue: () => "MPC",
      editableCell: true,
      type: "string",
      sumAcc: user.role === "ADMIN",
      applyFormat: true,
      applyFlag: true,
    },
  ];

  const handleManualValue = (item: any) => {
    if (item.action === "deleteLast") {
      return setValue((currentValue: any) =>
        Number(String(currentValue).slice(0, -1))
      );
    }

    if (item.action === "addPrice") {
      dispatchSale(
        saleActions.updateSaleByEmployee({ ...propSale, value })(dispatchSale)
      );

      setValue(0);
      setEditableRow(null);

      return setIsModalKeyboardNumOpen(false);
    }

    setValue((currentValue: any) =>
      Number(String(currentValue) + String(item.value))
    );
  };

  const handleNewRowSale = ({ emp }: any) => {
    setEmployeeSelectedForNewRowSale(emp);
    setIsModalNewRowSale(true);
  };

  const handleCountNumOrderByEmployee = ({ emp }: any) => {
    setEmployeeSelectedForNewRowSale(emp);
    setIsModalNewNumOrder(true);
  };

  const [selectedRow, setSelectedRow] = useState<any>(null);

  // Función para manejar la selección de la fila
  const handleRowClick = (row: any, e: any) => {
    setSelectedRow({ ...row, clientX: e.clientX, clientY: e.clientY });
    setShowToastDetailSale(true);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      setShowToastDetailSale(false);
    }, 4000);
  };

  useEffect(() => {
    if (
      lastSaleUpdated &&
      selectedRow &&
      lastSaleUpdated.id === selectedRow.id
    ) {
      setSelectedRow((current: any) => ({ ...current, ...lastSaleUpdated }));
    }
  }, [lastSaleUpdated]);

  const handleItemsSelected = (row: any, checked: any) => {
    const setIdsSelected =
      row.type === "ingreso" ? setCashflowIdSelected : setItemsIdSelected;

    setIdsSelected((items: any) => {
      if (checked) {
        return [...items, { id: row.id }];
      }

      return items.filter((i: any) => i.id !== row.id);
    });
  };

  useEffect(() => {
    setTotals({
      cash: Object.values(salesByEmployees).reduce(
        (acc: any, current: any) =>
          Number(acc) +
          current.reduce(
            (acc: any, current: any) =>
              Number(acc) + (current.cash < 0 ? 0 : current.cash),
            0
          ),
        0
      ),
      items: Object.values(salesByEmployees).reduce(
        (acc: any, current: any) =>
          Number(acc) +
          current.reduce(
            (acc: any, current: any) => Number(acc) + current.items,
            0
          ),
        0
      ),
      transfer: salesTransferByEmployees.reduce(
        (acc: any, current: any) => Number(acc) + current.transfer,
        0
      ),
      outgoing: outgoings.reduce(
        (acc: any, current: any) => Number(acc) + current.amount,
        0
      ),
    });
  }, [salesByEmployees, salesTransferByEmployees, outgoings]);

  const totalItemsSold = Object.entries(salesByEmployees).reduce(
    (acc: any, current: any) => {
      const [emp, sales] = current;

      return (
        acc + sales.reduce((acc: any, current: any) => acc + current.items, 0)
      );
    },
    0
  );

  return (
    <>
      <div
        className={`h-10 relative p-2 border ${themeStyles[theme].tailwindcss.border} flex items-center`}
      >
        <div className="inline-block">
          <label className="mr-2">Fecha:</label>

          <DatePicker
            onChange={(date: any) => setDate(date.format("YYYY-MM-DD"))}
            className={themeStyles[theme].datePickerIndicator}
            style={themeStyles[theme].datePicker}
            popupClassName={themeStyles[theme].classNameDatePicker}
            allowClear={false}
            format={dateFormat}
            value={dayjs(date)}
          />
        </div>

        {user.store === "ALL" && (
          <div className="ml-4 inline-block">
            <label className="mr-2">Filtrar por sucursal:</label>

            <Select
              value={mappingListStore[store]}
              className={themeStyles[theme].classNameSelector}
              dropdownStyle={themeStyles[theme].dropdownStylesCustom}
              popupClassName={themeStyles[theme].classNameSelectorItem}
              style={{ width: 110 }}
              onSelect={(value: any) => setStore(value)}
              options={listStore.map((data: any) => ({
                value: data.value,
                label: data.name,
              }))}
            />
          </div>
        )}

        <div
          className="ml-5
         inline-block"
        >
          <div
            className={`inline-block px-4 py-1 rounded-md border text-white select-none ${
              Boolean(date.length) &&
              "bg-[#1b78e2] border-[#1b78e2] hover:cursor-pointer hover:opacity-80 transition-opacity"
            } flex items-center mx-auto`}
            onClick={() => {
              if (!loading) {
                dispatchSale(
                  saleActions.getSalesCashByDay({ date, store })(dispatchSale)
                );

                dispatchSale(
                  saleActions.getSalesTranferByDay({ date, store })(
                    dispatchSale
                  )
                );

                dispatchCashflow(
                  cashflowActions.getCashFlowByDay({
                    date,
                    store,
                    type: "egreso",
                  })(dispatchCashflow)
                );
              }
            }}
          >
            Buscar
            {loading && (
              <div className="ml-2">
                <Spinner />
              </div>
            )}
          </div>
        </div>

        {(Boolean(itemsIdSelected.length) ||
          Boolean(cashflowIdSelected.length)) && (
          <div
            className="w-25 ml-2 bg-red-700 hover:bg-red-800 hover:cursor-pointer text-white px-4 py-1 rounded-md flex items-center justify-center select-none"
            onClick={() => {
              dispatchSale(
                saleActions.removeSales({
                  salesIds: itemsIdSelected,
                  cashflowIds: cashflowIdSelected,
                })(dispatchSale)
              );
              setItemsIdSelected([]);
              setCashflowIdSelected([]);
            }}
          >
            Eliminar Items
          </div>
        )}

        <div
          className="w-25 ml-[10vh] bg-blue-700 hover:bg-blue-800 hover:cursor-pointer text-white px-4 py-1 rounded-md flex items-center justify-center select-none"
          onClick={() => {
            dispatchSale(
              saleActions.getSalesTranferByDay({ date, store })(dispatchSale)
            );
            setIsModalListTranferSaleOpen(true);
          }}
        >
          Listado de Tranferencias
        </div>

        <div
          className="w-25 ml-2 bg-green-700 hover:bg-green-800 hover:cursor-pointer text-white px-4 py-1 rounded-md flex items-center justify-center select-none"
          onClick={() => {
            dispatchCashflow(
              cashflowActions.getCashFlowByDay({ date, store, type: "egreso" })(
                dispatchCashflow
              )
            );
            setIsModalListOutgoingOpen(true);
          }}
        >
          Egresos
        </div>

        <PDFDownloadLink
          document={
            <PdfLocalSale
              salesByEmployees={salesByEmployees}
              date={dayjs(date).format("DD-MM-YYYY")}
              store={mappingListStore[store]}
              totalItemsSold={totalItemsSold}
            />
          }
          fileName={`local-${dayjs(date).format("DD-MM-YYYY")}.pdf`}
          className="w-25 ml-2 bg-cyan-700 hover:bg-green-800 hover:cursor-pointer text-white px-4 py-1 rounded-md flex items-center justify-center select-none"
        >
          {({ loading, url, error, blob }) =>
            loading ? (
              <button>Cargando Documento ...</button>
            ) : (
              <button>Generar PDF</button>
            )
          }
        </PDFDownloadLink>
      </div>

      <div className="mt-5 h-[70vh] mx-auto max-w overflow-hidden overflow-y-auto overflow-x-auto">
        <div className="flex gap-2">
          {Boolean(Object.entries(salesByEmployees).length) &&
            Object.entries(salesByEmployees).map(
              (saleByEmployee: any, idx: number) => {
                const [emp, sales] = saleByEmployee;
                return (
                  <div className="w-50" key={emp}>
                    <div
                      className={`sticky top-0 z-10 mb-2 flex ${themeStyles[theme].tailwindcss.body}`}
                    >
                      <label className="text-2xl text-base mr-3 ml-auto">
                        {emp}
                      </label>
                      <div
                        className={`w-6 hover:cursor-pointer hover:bg-red-700 flex items-center justify-center rounded-md `}
                        onClick={() => handleCountNumOrderByEmployee({ emp })}
                      >
                        <GrPowerReset className="text-red-500 font-bold" />
                      </div>
                      <div
                        className={`w-6 hover:cursor-pointer hover:bg-green-700 flex items-center justify-center rounded-md`}
                        onClick={() => handleNewRowSale({ emp })}
                      >
                        <FaPlus className="text-green-500 font-bold" />
                      </div>
                    </div>
                    <TableSaleByDay
                      data={sales}
                      columns={columns}
                      table={`${idx}-`}
                      handleRowClick={handleRowClick}
                      handleRowDoubleClick={() =>
                        setIsModalSaleDetailOpen(true)
                      }
                      enableSelectItem={true}
                      rowsSelected={[...itemsIdSelected, ...cashflowIdSelected]}
                      handleItemsSelected={handleItemsSelected}
                    />
                    {Boolean(showToastDetailSale) && Boolean(selectedRow) && (
                      <div
                        className={`absolute shadow-lg rounded-lg p-4 ${themeStyles[theme].tailwindcss.modal}`}
                        style={{
                          top: selectedRow.clientY,
                          left: selectedRow.clientX,
                        }}
                      >
                        <p className="">
                          <>
                            {selectedRow.typeSale === "pedido" && (
                              <div>
                                N° Pedido:
                                <span className="font-bold mx-2">
                                  {selectedRow.order}
                                </span>
                              </div>
                            )}
                            <div>
                              Transferencia:
                              <span className="font-bold mx-2">
                                $
                                {formatCurrency(
                                  selectedRow.transfer
                                    ? selectedRow.transfer
                                    : 0
                                )}
                              </span>
                            </div>
                            <div>
                              Efectivo:
                              <span className="font-bold mx-2">
                                $
                                {formatCurrency(
                                  selectedRow.cash ? selectedRow.cash : 0
                                )}
                              </span>
                            </div>

                            {selectedRow.type !== "ingreso" && (
                              <div>
                                Total:
                                <span className="font-bold mx-2">
                                  $
                                  {formatCurrency(
                                    selectedRow.total ? selectedRow.total : 0
                                  )}
                                </span>
                              </div>
                            )}
                            {selectedRow.description && (
                              <div>
                                Comentario:
                                <span className="font-bold mx-2">
                                  {selectedRow.description}
                                </span>
                              </div>
                            )}
                          </>
                        </p>
                      </div>
                    )}
                  </div>
                );
              }
            )}
        </div>
        <ModalSaleDetail
          isModalSaleDetailOpen={isModalSaleDetailOpen}
          setIsModalSaleDetailOpen={setIsModalSaleDetailOpen}
          sale={selectedRow}
        />
        <ModalListTranferSale
          isModalListTransferSaleOpen={isModalListTranferSaleOpen}
          setIsModalListTransferSaleOpen={setIsModalListTranferSaleOpen}
          date={date}
          sales={salesTransferByEmployees}
          store={store}
        />
        <ModalListOutgoing
          isModalListOutgoingOpen={isModalListOutgoingOpen}
          setIsModalListOutgoingOpen={setIsModalListOutgoingOpen}
          date={date}
          outgoings={outgoings}
        />
      </div>
      <div className="h-[10vh] mt-[7vh] mx-auto max-w overflow-hidden overflow-y-auto overflow-x-auto">
        {user.role === "ADMIN" && (
          <Tag color="blue" className="p-2 text-base font-bold">
            Total Cash: ${formatCurrency(totals.cash)}
          </Tag>
        )}
        <Tag color="cyan" className="p-2 text-base font-bold">
          Total Transferencia: ${formatCurrency(totals.transfer)}
        </Tag>
        <Tag color="red" className="p-2 text-base font-bold">
          Total Egreso: ${formatCurrency(totals.outgoing)}
        </Tag>
        <Tag color="lime" className="p-2 text-base font-bold">
          Total Prendas: {totals.items}
        </Tag>
      </div>

      <KeyboardNum
        isModalKeyboardNumOpen={isModalKeyboardNumOpen}
        manualNum={value}
        handleManualNum={handleManualValue}
        closeModal={() => {
          dispatchSale(
            saleActions.removeEmptyRows({ emp: employeeSelectedForNewRowSale })(
              dispatchSale
            )
          );
          setValue(0);
          setEditableRow(null);
          setEmployeeSelectedForNewRowSale("");
          setIsModalKeyboardNumOpen(false);
        }}
        title={"Ingrese " + mappingConceptToUpdate[propSale.dataIndex]}
      />

      <NewRowSale
        isModalNewRowSale={isModalNewRowSale}
        setIsModalNewRowSale={setIsModalNewRowSale}
        employee={employeeSelectedForNewRowSale}
      />

      <NewNumOrder
        isModalNewNumOrder={isModalNewNumOrder}
        setIsModalNewNumOrder={setIsModalNewNumOrder}
        employee={employeeSelectedForNewRowSale}
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

export default SalesByDayContainer;
