import { formatCurrency } from "../../utils/formatUtils";
import Spinner from "../../components/Spinner";
import { useState, useEffect } from "react";
import IncomeContainer from "./IncomeContainer";
import OutgoingContainer from "./OutgoingContainer";
import ObservationContainer from "./ObservationContainer";
import { Select } from "antd";
import { useTheme } from "../../contexts/ThemeContext";
import { priceActions, usePrice } from "../../contexts/PriceContext";
import { useCashier } from "../../contexts/CashierContext";
import { useUser } from "../../contexts/UserContext";

const ListOfPricesContainer = ({
  prices,
  pricesSelected,
  setPricesSelected,
  devolutionModeActive,
  setDevolutionModeActive,
  devolutionPricesSelected,
  setDevolutionPricesSelected,
  isLoading,
  setEnabledDisplacedPrices,
  setEnabledDisplacedDevolutions,
}: any) => {
  const [isModalIncomeOpen, setIsModalIncomeOpen] = useState(false);
  const [isModalOutgoingOpen, setIsModalOutgoingOpen] = useState(false);
  const [isModalObservationOpen, setIsModalObservationOpen] = useState(false);
  const {
    state: { theme, themeStyles },
  } = useTheme();
  const {
    state: { order },
    dispatch: dispatchPrice,
  } = usePrice();

  // Cajeros
  const {
    state: { user },
  } = useUser();
  const {
    cashiers,
    selectedCashier,
    selectCashier,
    fetchAllCashiers,
    getCashiersForStore,
  } = useCashier();

  const isAdmin = user?.role === "ADMIN";
  const userStore = user?.store || "ALL";

  // Cargar cajeros al montar
  useEffect(() => {
    fetchAllCashiers();
  }, []);

  // Filtrar cajeros por sucursal (admin ve todos)
  const filteredCashiers = isAdmin ? cashiers : getCashiersForStore(userStore);

  const handleCashierChange = (cashierId: string | null) => {
    if (!cashierId) {
      selectCashier(null);
    } else {
      const cashier = filteredCashiers.find((c: any) => c.id === cashierId);
      if (cashier) {
        selectCashier({
          id: cashier.id,
          name: cashier.name,
          color: cashier.color,
          store: cashier.store,
        });
      }
    }
  };

  const pricesItems = devolutionModeActive
    ? devolutionPricesSelected
    : pricesSelected;
  const setPricesItems = devolutionModeActive
    ? setDevolutionPricesSelected
    : setPricesSelected;
  const setEnabledDisplaced = devolutionModeActive
    ? setEnabledDisplacedDevolutions
    : setEnabledDisplacedPrices;

  const onProductSelect = (item: any) => {
    const lastItem = [...pricesItems].pop();

    setEnabledDisplaced(true);

    // Normalizar tipos para comparación (undefined o "jeans" se tratan como "jeans")
    const lastItemType = lastItem?.type || "jeans";
    const itemType = item.type || "jeans";

    // Buscar si ya existe un item con el mismo precio Y tipo
    if (lastItem && lastItem.price === item.price && lastItemType === itemType) {
      let itemIncremented = false;

      const pricesReversed = [...pricesItems].reverse();

      const productsUpdated = pricesReversed.map((product: any) => {
        const productType = product.type || "jeans";
        if (!itemIncremented && product.price === item.price && productType === itemType) {
          itemIncremented = true;
          product.quantity = product.quantity + 1;
        }

        return product;
      });

      return setPricesItems(productsUpdated.reverse());
    }

    setPricesItems((items: any) => {
      const maxId = Math.max(
        ...items.map((item: any) => item.id),
        ...prices.map((item: any) => item.id)
      );

      const newItem = {
        id: maxId + 1,
        price: item.price,
        quantity: 1,
        active: true,
        type: item.type || "jeans", // Incluir el tipo del precio
      };
      return [...items, newItem];
    });
  };

  // Función para obtener el estilo del indicador de tipo
  const getTypeIndicator = (type: string) => {
    if (type === "remera") {
      return {
        letter: "R",
        color: "text-green-400",
        bgColor: "bg-green-600/30",
      };
    }
    // Default: jeans
    return {
      letter: "J",
      color: "text-blue-400",
      bgColor: "bg-blue-600/30",
    };
  };

  return (
    <>
      <div className={`p-2 border ${themeStyles[theme].tailwindcss.border}`}>
        <div className="ml-4 inline-block">
          <label className="mr-2">Ordenar:</label>
          <Select
            className={themeStyles[theme].classNameSelector}
            dropdownStyle={themeStyles[theme].dropdownStylesCustom}
            popupClassName={themeStyles[theme].classNameSelectorItem}
            style={{ width: 100 }}
            value={order}
            onSelect={(value: string) =>
              dispatchPrice(priceActions.setOrderPrices(value)(dispatchPrice))
            }
            options={[
              { label: "Mayor", value: "higher" },
              { label: "Menor", value: "lower" },
            ]}
          />
        </div>

        <div className="ml-5 inline-block">
          <div
            className={`cursor-pointer inline-block px-4 py-1 rounded-md border ${
              devolutionModeActive && "bg-red-600 text-white"
            } border-red-500 `}
            onClick={() => {
              setDevolutionModeActive((currentMode: boolean) => !currentMode);
            }}
          >
            Devolución: {`${devolutionModeActive ? "ON" : "OFF"}`}
          </div>
        </div>
      </div>

      <div
        className={` relative p-2 border-x ${themeStyles[theme].tailwindcss.border}`}
      >
        <div
          className={`cursor-pointer inline-block px-4 py-1 rounded-md bg-green-600 text-white`}
          onClick={() => {
            setIsModalIncomeOpen(true);
          }}
        >
          INGRESOS
        </div>
        <div
          className={`ml-2 cursor-pointer inline-block px-4 py-1 rounded-md bg-red-600 text-white`}
          onClick={() => {
            setIsModalOutgoingOpen(true);
          }}
        >
          EGRESOS
        </div>
        <div
          className={`ml-2 cursor-pointer inline-block px-4 py-1 rounded-md bg-blue-600 text-white`}
          onClick={() => {
            setIsModalObservationOpen(true);
          }}
        >
          OBSERVACIONES
        </div>

        {/* Divider vertical + Selector de Cajero */}
        <div className="inline-block ml-4 pl-4 border-l border-gray-500">
          <label className="mr-2 text-white font-medium">Cajero:</label>
          <Select
            className={themeStyles[theme].classNameSelector}
            dropdownStyle={themeStyles[theme].dropdownStylesCustom}
            popupClassName={themeStyles[theme].classNameSelectorItem}
            style={{ width: 160 }}
            value={selectedCashier?.id || undefined}
            onChange={handleCashierChange}
            allowClear
            placeholder="Seleccione"
            optionLabelProp="label"
          >
            {filteredCashiers.map((cashier: any) => (
              <Select.Option
                key={cashier.id}
                value={cashier.id}
                label={
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: cashier.color,
                        display: "inline-block",
                      }}
                    />
                    {cashier.name}
                  </span>
                }
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      backgroundColor: cashier.color,
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  <span>{cashier.name}</span>
                  {isAdmin && cashier.store && (
                    <span style={{ opacity: 0.6, fontSize: 11, marginLeft: 4 }}>
                      ({cashier.store})
                    </span>
                  )}
                </div>
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>
      <div
        className={`h-[78vh] p-2 border ${themeStyles[theme].tailwindcss.border} overflow-hidden overflow-y-auto`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-[70vh]">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="h-auto flex flex-wrap gap-2">
            {prices.map((item: any) => {
              const typeIndicator = getTypeIndicator(item.type);

              return (
                <div
                  key={item.id}
                  className={`relative w-[13vh] h-[10vh] p-2 border ${themeStyles[theme].tailwindcss.border} text-center transition-all ${themeStyles[theme].tailwindcss.priceBox} hover:cursor-pointer flex items-center justify-center text-lg font-bold select-none`}
                  onClick={() => onProductSelect(item)}
                >
                  {/* Indicador de tipo (J/R) en esquina superior derecha */}
                  <div
                    className={`absolute top-1 right-1 w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${typeIndicator.bgColor} ${typeIndicator.color}`}
                  >
                    {typeIndicator.letter}
                  </div>
                  {formatCurrency(item.price)}
                </div>
              );
            })}
          </div>
        )}

        <IncomeContainer
          isModalIncomeOpen={isModalIncomeOpen}
          setIsModalIncomeOpen={setIsModalIncomeOpen}
        />
        <OutgoingContainer
          isModalOutgoingOpen={isModalOutgoingOpen}
          setIsModalOutgoingOpen={setIsModalOutgoingOpen}
        />
        <ObservationContainer
          isModalObservationOpen={isModalObservationOpen}
          setIsModalObservationOpen={setIsModalObservationOpen}
        />
      </div>
    </>
  );
};

export default ListOfPricesContainer;
