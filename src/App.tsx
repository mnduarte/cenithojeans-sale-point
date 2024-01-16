import { useEffect, useState } from "react";
import { setupIonicReact } from "@ionic/react";
import { MdBorderColor, MdOutlineAddShoppingCart } from "react-icons/md";
import { FaList } from "react-icons/fa";

import { PriceProvider, priceActions, usePrice } from "./contexts/PriceContext";
import {
  EmployeeProvider,
  employeeActions,
  useEmployee,
} from "./contexts/EmployeeContext";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme tailwind */
import "./theme/tailwind.css";
/* Theme variables */
import "./theme/variables.css";
import PricesEmployeesContainer from "./containers/PricesEmployeesContainer";
import SalesContainer from "./containers/SalesContainer";
import OrdersContainer from "./containers/OrdersContainer";
import { SaleProvider } from "./contexts/SaleContext";
import { UserProvider, useUser, userActions } from "./contexts/UserContext";
import Spinner from "./components/Spinner";
import Keyboard from "./components/Keyboard";
import { StoreProvider, storeActions, useStore } from "./contexts/StoreContext";
import { CashflowProvider } from "./contexts/CashflowContext";

setupIonicReact();

type TabKey = "Ventas" | "Precios y Empleados" | "Pedidos";

const mappingTabs = {
  Ventas: {
    title: "Ventas",
    icon: <MdOutlineAddShoppingCart />,
    container: <SalesContainer />,
    permission: ["EMPLOYEE", "ADMIN"],
  },
  "Precios y Empleados": {
    title: "Precios y Empleados",
    icon: <FaList />,
    container: <PricesEmployeesContainer />,
    permission: ["ADMIN"],
  },
  Pedidos: {
    title: "Pedidos",
    icon: <MdBorderColor />,
    container: <OrdersContainer />,
    permission: ["EMPLOYEE", "ADMIN"],
  },
};

const SalePointContainer = ({ role, store }: any) => {
  const [activeTab, setActiveTab] = useState<TabKey>("Ventas");
  const { dispatch: dispatchPrice } = usePrice();
  const { dispatch: dispatchEmployee } = useEmployee();
  const { dispatch: dispatchStore } = useStore();

  useEffect(() => {
    dispatchPrice(priceActions.getAll()(dispatchPrice));
    dispatchEmployee(employeeActions.getAll({ store })(dispatchEmployee));
    dispatchStore(storeActions.getAll()(dispatchStore));
  }, []);

  const mappingTabsByRole = Object.values(mappingTabs).filter((tabs: any) =>
    tabs.permission.includes(role)
  );

  return (
    <div className="max-w-5xl mx-auto mt-2 h-2/3 h-[90vh]">
      <div className="flex mb-4">
        {mappingTabsByRole.map((tab: any) => (
          <button
            key={tab.title}
            className={`flex-1 p-2 border-solid border-2 border-[#484E55] text-white text-lg ${
              activeTab === tab.title
                ? "bg-[#1BA1E2] "
                : "bg-[#333333] hover:bg-[#484E55]"
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

const LoginContainer = ({ onLogin, error, loading }: any) => {
  const [user, setUser] = useState({
    username: "",
    password: "",
  });
  const [inputSelected, setInputSelected] = useState("username");

  useEffect(() => {
    if (error) {
      setUser({
        username: "",
        password: "",
      });
    }
  }, [error]);

  return (
    <div className="fixed inset-0 bg-[#252525] bg-opacity-60 flex justify-center mt-10">
      {/* Contenido del modal */}
      <div className="w-[55vh] h-[60vh] p-8 rounded shadow-md relative">
        <h2 className="text-white text-lg font-bold mb-8">Punto de venta</h2>

        <div className="mb-4">
          <label className="block text-white mb-2">Usuario:</label>
          <input
            type="text"
            value={user.username}
            onChange={(e) =>
              setUser((userProps) => ({
                ...userProps,
                username: e.target.value,
              }))
            }
            onFocus={() => setInputSelected("username")}
            className="w-[30vh] bg-gray-700 text-white p-2 rounded-md w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block text-white mb-2">Clave:</label>
          <input
            type="password"
            value={user.password}
            onChange={(e) =>
              setUser((userProps) => ({
                ...userProps,
                password: e.target.value,
              }))
            }
            onFocus={() => setInputSelected("password")}
            className="w-[30vh] bg-gray-700 text-white p-2 rounded-md w-full"
          />
        </div>

        <div className="h-[1vh] flex items-center select-none text-red-500">
          {error}
        </div>

        <div className="flex item-start mt-4">
          <div
            className={`${
              !Boolean(user.username.length) || !Boolean(user.password.length)
                ? "bg-[#333333]"
                : "bg-green-600 hover:bg-green-700 hover:cursor-pointer"
            } text-white px-4 py-2 rounded-md flex items-center mx-auto select-none`}
            onClick={() => onLogin(user)}
          >
            Ingresar
            {loading && (
              <div className="ml-2">
                <Spinner />
              </div>
            )}
          </div>
        </div>
        <Keyboard
          onKeyPress={(e: any) => {
            if (inputSelected === "username") {
              setUser((userProps) => ({
                ...userProps,
                username: e.action
                  ? e.action === "deleteLast"
                    ? userProps.username.slice(0, -1)
                    : userProps.username + " "
                  : userProps.username + e.value.toLowerCase(),
              }));
            }

            if (inputSelected === "password") {
              setUser((userProps) => ({
                ...userProps,
                password: e.action
                  ? e.action === "deleteLast"
                    ? userProps.password.slice(0, -1)
                    : userProps.password + " "
                  : userProps.password + e.value.toLowerCase(),
              }));
            }
          }}
        />
      </div>
    </div>
  );
};

const AppContainer = () => {
  const {
    state: { user, error, loading },
    dispatch,
  } = useUser();

  const onLogin = (user: any) => dispatch(userActions.login(user)(dispatch));

  if (!user.username) {
    return <LoginContainer onLogin={onLogin} error={error} loading={loading} />;
  }

  return <SalePointContainer role={user.role} store={user.store} />;
};

const App: React.FC = () => {
  return (
    <UserProvider>
      <StoreProvider>
        <SaleProvider>
          <PriceProvider>
            <EmployeeProvider>
              <CashflowProvider>
                <AppContainer />
              </CashflowProvider>
            </EmployeeProvider>
          </PriceProvider>
        </SaleProvider>
      </StoreProvider>
    </UserProvider>
  );
};

export default App;
