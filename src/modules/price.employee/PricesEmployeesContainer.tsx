import { useEffect, useState } from "react";
import { usePrice, priceActions } from "../../contexts/PriceContext";
import { useEmployee, employeeActions } from "../../contexts/EmployeeContext";
import Table from "../../components/Table";
import PriceForm from "./PriceForm";
import EmployeeForm from "./EmployeeForm";
import CashierForm from "./CashierForm";
import { IoIosPricetags } from "react-icons/io";
import { FaUsers } from "react-icons/fa";
import { FaCashRegister } from "react-icons/fa";
import { formatCurrency } from "../../utils/formatUtils";
import { useStore } from "../../contexts/StoreContext";
import { useTheme } from "../../contexts/ThemeContext";
import { MdAccountTree } from "react-icons/md";
import {
  accountForTransferActions,
  useAccountForTransfer,
} from "../../contexts/AccountForTransferContext";
import AccountForTransferForm from "./AccountForTransferForm";
import { useCashier } from "../../contexts/CashierContext";
import {
  CASHIER_COLORS,
  getTextColorForBackground,
} from "../../utils/cashierColors";

type PriceSubTab = "jeans" | "remeras";

// Mapeo para mostrar el tipo de venta en español
const SALE_TYPE_LABELS: Record<string, string> = {
  ambos: "Ambos",
  local: "Local",
  pedido: "Pedido",
};

const PricesContainer = () => {
  const {
    state: { prices, loading },
    dispatch,
  } = usePrice();
  const {
    state: { theme, themeStyles },
  } = useTheme();

  const initialValues = {
    id: "",
    price: "",
    active: true,
    type: "jeans" as "jeans" | "remera",
  };
  const [isNewPrice, setIsNewPrice] = useState(true);
  const [priceValues, setPriceValues] = useState(initialValues);
  const [itemSelected, setItemSelected] = useState<any>({});
  const [itemsIdSelected, setItemsIdSelected] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<PriceSubTab>("jeans");

  // Filtrar precios por tipo
  const filteredPrices = prices.filter((price: any) => {
    if (activeSubTab === "jeans") {
      return price.type === "jeans" || !price.type; // incluir los que no tienen type (legacy)
    }
    return price.type === "remera";
  });

  const columns = [
    {
      title: "Precio",
      dataIndex: "price",
      format: (number: any) => `$${formatCurrency(number)}`,
    },
    { title: "Activo", dataIndex: "active" },
  ];

  // Cuando cambia el sub-tab, actualizar el tipo en el formulario
  useEffect(() => {
    setPriceValues((prev) => ({
      ...prev,
      type: activeSubTab === "jeans" ? "jeans" : "remera",
    }));
    setItemSelected({});
    setItemsIdSelected([]);
    setIsNewPrice(true);
  }, [activeSubTab]);

  return (
    <div className="h-[73vh] mx-auto flex flex-col">
      {/* Sub-tabs Jeans / Remeras */}
      <div className="flex mb-4">
        <button
          className={`flex-1 py-2 text-lg font-medium rounded-l-md transition-colors ${
            activeSubTab === "jeans"
              ? "bg-blue-600 text-white"
              : themeStyles[theme].tailwindcss.menuTab
          }`}
          onClick={() => setActiveSubTab("jeans")}
        >
          <span
            className={`font-bold ${
              activeSubTab === "jeans" ? "text-white" : "text-blue-400"
            }`}
          >
            J
          </span>{" "}
          Jeans
        </button>
        <button
          className={`flex-1 py-2 text-lg font-medium rounded-r-md transition-colors ${
            activeSubTab === "remeras"
              ? "bg-green-600 text-white"
              : themeStyles[theme].tailwindcss.menuTab
          }`}
          onClick={() => setActiveSubTab("remeras")}
        >
          <span
            className={`font-bold ${
              activeSubTab === "remeras" ? "text-white" : "text-green-400"
            }`}
          >
            R
          </span>{" "}
          Remeras
        </button>
      </div>

      <div className="flex flex-1">
        <div className="w-4/5 p-2">
          <h3 className="text-2xl mb-4">
            Listado de Precios de{" "}
            {activeSubTab === "jeans" ? "Jeans" : "Remeras"}
          </h3>

          <div className="h-[5vh] flex">
            <div
              className="w-1/3 bg-blue-500 hover:bg-blue-700 hover:cursor-pointer text-white px-4 py-2 rounded-md flex items-center justify-center select-none"
              onClick={() => {
                setPriceValues({
                  ...initialValues,
                  type: activeSubTab === "jeans" ? "jeans" : "remera",
                });
                setIsNewPrice(true);
                setItemSelected({});
                setItemsIdSelected([]);
                dispatch(
                  priceActions.deleteSelectedPrices({
                    itemsIdSelected,
                    deleteAll: true,
                    type: activeSubTab === "jeans" ? "jeans" : "remera",
                  })(dispatch)
                );
              }}
            >
              Eliminar Todos los Precios
            </div>
            {Boolean(itemsIdSelected.length) && (
              <div
                className="w-1/3 ml-2 bg-red-700 hover:bg-red-800 hover:cursor-pointer text-white px-4 py-2 rounded-md flex items-center justify-center select-none"
                onClick={() => {
                  setPriceValues({
                    ...initialValues,
                    type: activeSubTab === "jeans" ? "jeans" : "remera",
                  });
                  setIsNewPrice(true);
                  setItemSelected({});
                  setItemsIdSelected([]);
                  dispatch(
                    priceActions.deleteSelectedPrices({
                      itemsIdSelected,
                      deleteAll: false,
                    })(dispatch)
                  );
                }}
              >
                Eliminar Precios Seleccionados
              </div>
            )}
          </div>
          <div className="h-[55vh] mx-auto max-w overflow-hidden overflow-y-auto">
            <Table
              data={filteredPrices}
              columns={columns}
              itemSelected={itemSelected}
              setItemSelected={setItemSelected}
              itemsIdSelected={itemsIdSelected}
              setItemsIdSelected={setItemsIdSelected}
              enableSelectItem={true}
            />
          </div>
        </div>
        <div className="w-1/3 p-2">
          <PriceForm
            itemSelected={itemSelected}
            setItemSelected={setItemSelected}
            onAddPrice={(price: any) =>
              dispatch(priceActions.addPrice(price)(dispatch))
            }
            onUpdatePrice={(price: any) =>
              dispatch(priceActions.updatePrice(price)(dispatch))
            }
            onDeletePrice={(price: any) =>
              dispatch(priceActions.removePrice(price)(dispatch))
            }
            isLoading={loading}
            initialValues={{
              ...initialValues,
              type: activeSubTab === "jeans" ? "jeans" : "remera",
            }}
            isNewPrice={isNewPrice}
            setIsNewPrice={setIsNewPrice}
            priceValues={priceValues}
            setPriceValues={setPriceValues}
            currentType={activeSubTab === "jeans" ? "jeans" : "remera"}
          />
        </div>
      </div>
    </div>
  );
};

const EmployeesContainer = () => {
  const {
    state: { employees, loading },
    dispatch,
  } = useEmployee();
  const {
    state: { stores },
  } = useStore();
  const [itemSelected, setItemSelected] = useState<any>({});

  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
    },
    { title: "Posicion", dataIndex: "position" },
    { title: "Sucursal", dataIndex: "store" },
    {
      title: "Tipo Venta",
      dataIndex: "saleType",
      format: (value: string) => SALE_TYPE_LABELS[value] || "Ambos",
    },
    { title: "Activo", dataIndex: "active" },
    { title: "Activo para Pagos", dataIndex: "activeForCost" },
  ];

  return (
    <div className="h-[73vh] mx-auto flex">
      <div className="w-4/5 p-2">
        <h3 className="text-2xl mb-4">Listado de Empleados</h3>
        <div className="h-[65vh] mx-auto max-w overflow-hidden overflow-y-auto">
          <Table
            data={employees}
            columns={columns}
            itemSelected={itemSelected}
            setItemSelected={setItemSelected}
            showZero={true}
          />
        </div>
      </div>
      <div className="w-1/3 p-2">
        <EmployeeForm
          itemSelected={itemSelected}
          setItemSelected={setItemSelected}
          onAddEmployee={(employee: any) =>
            dispatch(employeeActions.addEmployee(employee)(dispatch))
          }
          onUpdateEmployee={(employee: any) =>
            dispatch(employeeActions.updateEmployee(employee)(dispatch))
          }
          onDeleteEmployee={(employee: any) =>
            dispatch(employeeActions.removeEmployee(employee)(dispatch))
          }
          isLoading={loading}
          stores={stores}
          totalPositions={employees.length}
        />
      </div>
    </div>
  );
};

const AccountsForTransferContainer = () => {
  const {
    state: { accountsForTransfer, loading },
    dispatch,
  } = useAccountForTransfer();
  const {
    state: { stores },
  } = useStore();
  const [itemSelected, setItemSelected] = useState<any>({});

  useEffect(() => {
    dispatch(accountForTransferActions.getAll({ store: "ALL" })(dispatch));
  }, []);

  const columns = [
    {
      title: "Nombre de cuenta",
      dataIndex: "name",
    },
    { title: "Posicion", dataIndex: "position" },
    { title: "Sucursal", dataIndex: "store" },
    { title: "Activo", dataIndex: "active" },
  ];

  return (
    <div className="h-[73vh] mx-auto flex">
      <div className="w-4/5 p-2">
        <h3 className="text-2xl mb-4">Listado de Cuentas para Transferir</h3>
        <div className="h-[65vh] mx-auto max-w overflow-hidden overflow-y-auto">
          <Table
            data={accountsForTransfer}
            columns={columns}
            itemSelected={itemSelected}
            setItemSelected={setItemSelected}
            showZero={true}
          />
        </div>
      </div>
      <div className="w-1/3 p-2">
        <AccountForTransferForm
          itemSelected={itemSelected}
          setItemSelected={setItemSelected}
          onAddAccountTransfer={(accountTransfer: any) =>
            dispatch(
              accountForTransferActions.addAccountForTransfer(accountTransfer)(
                dispatch
              )
            )
          }
          onUpdateAccountTransfer={(accountTransfer: any) =>
            dispatch(
              accountForTransferActions.updateAccountForTransfer(
                accountTransfer
              )(dispatch)
            )
          }
          onDeleteAccountTransfer={(accountTransfer: any) =>
            dispatch(
              accountForTransferActions.removeAccountForTransfer(
                accountTransfer
              )(dispatch)
            )
          }
          isLoading={loading}
          stores={stores}
          totalPositions={accountsForTransfer.length}
        />
      </div>
    </div>
  );
};

const CashiersContainer = () => {
  const {
    cashiers,
    loading,
    fetchAllCashiers,
    addCashier,
    editCashier,
    removeCashier,
  } = useCashier();
  const {
    state: { stores },
  } = useStore();
  const [itemSelected, setItemSelected] = useState<any>({});

  useEffect(() => {
    fetchAllCashiers();
  }, []);

  // Transformar cashiers para mostrar el color visualmente
  const cashiersWithColorDisplay = cashiers.map((cashier: any) => ({
    ...cashier,
    colorDisplay: cashier.color, // Para la columna visual
  }));

  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
    },
    { title: "Posición", dataIndex: "position" },
    { title: "Sucursal", dataIndex: "store" },
    {
      title: "Color",
      dataIndex: "colorDisplay",
      format: (color: string) => (
        <div
          style={{
            backgroundColor: color,
            color: getTextColorForBackground(color),
            padding: "4px 12px",
            borderRadius: "4px",
            textAlign: "center" as const,
            fontWeight: 500,
          }}
        >
          {CASHIER_COLORS.find((c) => c.value === color)?.label || color}
        </div>
      ),
    },
    {
      title: "Admin",
      dataIndex: "isAdmin",
      format: (value: boolean) => (
        <span className={value ? "text-yellow-400 font-bold" : "text-gray-500"}>
          {value ? "Sí" : "No"}
        </span>
      ),
    },
  ];

  return (
    <div className="h-[73vh] mx-auto flex">
      <div className="w-4/5 p-2">
        <h3 className="text-2xl mb-4">Listado de Cajeros</h3>
        <div className="h-[65vh] mx-auto max-w overflow-hidden overflow-y-auto">
          <Table
            data={cashiersWithColorDisplay}
            columns={columns}
            itemSelected={itemSelected}
            setItemSelected={setItemSelected}
            showZero={true}
          />
        </div>
      </div>
      <div className="w-1/3 p-2">
        <CashierForm
          itemSelected={itemSelected}
          setItemSelected={setItemSelected}
          onAddCashier={addCashier}
          onUpdateCashier={editCashier}
          onDeleteCashier={removeCashier}
          isLoading={loading}
          stores={stores}
          totalPositions={cashiers.length}
        />
      </div>
    </div>
  );
};

type TabKey = "Precios" | "Empleados" | "CPT" | "Cajeros";

const mappingTabs = {
  Precios: {
    title: "Precios",
    icon: <IoIosPricetags />,
    container: <PricesContainer />,
  },
  Empleados: {
    title: "Empleados",
    icon: <FaUsers />,
    container: <EmployeesContainer />,
  },
  CPT: {
    title: "CPT",
    icon: <MdAccountTree />,
    container: <AccountsForTransferContainer />,
  },
  Cajeros: {
    title: "Cajeros",
    icon: <FaCashRegister />,
    container: <CashiersContainer />,
  },
};

const PricesEmployeesContainer = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("Precios");
  const {
    state: { theme, themeStyles },
  } = useTheme();

  return (
    <div className="max-w-5xl mx-auto mt-5 h-2/3 h-[90vh]">
      <div className="w-2/3 h-[5vh] flex mb-4">
        {Object.values(mappingTabs).map((tab: any) => (
          <button
            key={tab.title}
            className={`flex-1 text-lg ${
              activeTab === tab.title
                ? "bg-[#1BA1E2] text-white"
                : themeStyles[theme].tailwindcss.menuTab
            }`}
            onClick={() => setActiveTab(tab.title)}
          >
            <div className="flex items-center justify-center">
              {tab.icon}
              <span className="ml-2">{tab.title}</span>
            </div>
          </button>
        ))}
      </div>

      {mappingTabs[activeTab].container}
    </div>
  );
};

export default PricesEmployeesContainer;
