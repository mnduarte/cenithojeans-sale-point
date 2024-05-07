import { formatCurrency } from "../utils/formatUtils";
import Spinner from "../components/Spinner";
import { useState } from "react";
import IncomeContainer from "./IncomeContainer";
import OutgoingContainer from "./OutgoingContainer";
import ObservationContainer from "./ObservationContainer";
import { Select } from "antd";
import { useTheme } from "../contexts/ThemeContext";
import { priceActions, usePrice } from "../contexts/PriceContext";

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

    //if (lastItem && lastItem.id === item.id) {
    if (lastItem && lastItem.price === item.price) {
      let itemIncremented = false;

      const pricesReversed = [...pricesItems].reverse();

      const productsUpdated = pricesReversed.map((product: any) => {
        if (!itemIncremented && product.price === item.price) {
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
      };
      return [...items, newItem];
    });
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
              const foundItem = pricesItems.find(
                (itemSelected: any) => itemSelected.price === item.price
              );
              const boxBorderStyle = foundItem
                ? devolutionModeActive
                  ? "border-red-500"
                  : "border-[#1BA1E2]"
                : themeStyles[theme].tailwindcss.border;

              return (
                <div
                  key={item.id}
                  className={`w-[13vh] h-[10vh] p-2 border ${boxBorderStyle} text-center transition-all  ${themeStyles[theme].tailwindcss.priceBox} hover:cursor-pointer flex items-center justify-center text-lg font-bold select-none`}
                  onClick={() => onProductSelect(item)}
                >
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
