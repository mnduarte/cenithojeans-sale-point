import { formatCurrency } from "../utils/formatUtils";
import { FaSearch } from "react-icons/fa";
import { Price } from "../types";
import Spinner from "../components/Spinner";
import { useEffect, useState } from "react";
import IncomeContainer from "./IncomeContainer";
import OutgoingContainer from "./OutgoingContainer";

const ListOfPricesContainer = ({
  prices,
  setSearchAmount,
  setPricesFiltered,
  pricesSelected,
  setPricesSelected,
  searchAmount,
  pricesFiltered,
  devolutionModeActive,
  setDevolutionModeActive,
  devolutionPricesSelected,
  setDevolutionPricesSelected,
  isLoading,
}: any) => {
  const [isVertical, setIsVertical] = useState(
    window.matchMedia("(orientation: portrait)").matches
  );

  const [isModalIncomeOpen, setIsModalIncomeOpen] = useState(false);
  const [isModalOutgoingOpen, setIsModalOutgoingOpen] = useState(false);

  useEffect(() => {
    const handleOrientationChange = () => {
      setIsVertical(window.matchMedia("(orientation: portrait)").matches);
    };

    // Agregar el event listener para el cambio de orientación
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      // Remover el event listener al desmontar el componente
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  const pricesItems = devolutionModeActive
    ? devolutionPricesSelected
    : pricesSelected;
  const setPricesItems = devolutionModeActive
    ? setDevolutionPricesSelected
    : setPricesSelected;

  const handleSearchAmount = (event: any) => {
    const inputValue = event.target.value;
    if (/^\d*$/.test(inputValue)) {
      setSearchAmount(inputValue);

      setPricesFiltered(
        prices.filter((item: any) =>
          item.price.toString().includes(String(inputValue))
        )
      );
    }
  };

  const onOrderProducts = (e: any) => {
    setPricesFiltered((items: any) =>
      items
        .slice()
        .sort((a: Price, b: Price) =>
          e.target.value === "lower" ? a.price - b.price : b.price - a.price
        )
    );
  };

  const onProductSelect = (item: any) => {
    const lastItem = [...pricesItems].pop();

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

    /*const foundItem = pricesItems.find(
      (itemSelected: any) => itemSelected.id === item.id
    );

    if (!foundItem) {
      item.quantity = 1;
      return setPricesItems((items: any) => [...items, item]);
    }

    const productsUpdated = pricesItems.map((item: any) => {
      return foundItem.id === item.id
        ? { ...item, quantity: item.quantity + 1 }
        : item;
    });

    setPricesItems(productsUpdated);*/
  };

  return (
    <>
      <div className={`h-[6vh] relative p-2 border border-[#484E55]`}>
        <input
          type="text"
          placeholder="Buscar"
          className="w-1/4 p-1 border border-[#484E55] rounded-md pl-10"
          value={searchAmount}
          onChange={handleSearchAmount}
        />
        <div className="absolute top-5 left-5">
          <FaSearch className="text-white" />
        </div>
        <div className="ml-4 inline-block">
          <label className="mr-2 text-white">Ordenar:</label>
          <select
            className="p-1 border border-[#484E55] rounded-md"
            onChange={onOrderProducts}
            defaultValue=""
          >
            <option value="" className="py-2" disabled hidden>
              -
            </option>
            <option value="higher" className="py-2">
              Mayor
            </option>
            <option value="lower" className="py-2">
              Menor
            </option>
          </select>
        </div>

        <div className="ml-5 inline-block">
          <div
            className={`cursor-pointer inline-block px-4 py-1 rounded-md border ${
              devolutionModeActive && "bg-red-600"
            } border-red-500 text-white`}
            onClick={() => {
              setDevolutionModeActive((currentMode: boolean) => !currentMode);
            }}
          >
            Devolución: {`${devolutionModeActive ? "ON" : "OFF"}`}
          </div>
        </div>
      </div>

      <div className={`h-[6vh] relative p-2 border border-[#484E55]`}>
        <div
          className={`cursor-pointer inline-block px-4 py-1 rounded-md border bg-green-800 border-green-800 text-white`}
          onClick={() => {
            setIsModalIncomeOpen(true);
          }}
        >
          INGRESOS
        </div>
        <div
          className={`ml-2 cursor-pointer inline-block px-4 py-1 rounded-md border bg-red-800 border-red-800 text-white`}
          onClick={() => {
            setIsModalOutgoingOpen(true);
          }}
        >
          EGRESOS
        </div>
      </div>
      <div className="h-[75vh] p-2 border border-[#484E55] overflow-hidden overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-[70vh]">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="h-auto flex flex-wrap gap-2">
            {pricesFiltered.map((item: any) => {
              const foundItem = pricesItems.find(
                (itemSelected: any) => itemSelected.price === item.price
              );
              const boxBorderStyle = foundItem
                ? devolutionModeActive
                  ? "border-red-500"
                  : "border-[#1BA1E2]"
                : "border-[#484E55]";

              return (
                <div
                  key={item.id}
                  className={`${
                    isVertical ? "w-[8vh] h-[6vh]" : "w-[13vh] h-[10vh]"
                  } p-2 border ${boxBorderStyle} bg-[#333333] text-white text-center transition-all hover:bg-[#484E55] hover:cursor-pointer flex items-center justify-center text-lg font-bold select-none`}
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
      </div>
    </>
  );
};

export default ListOfPricesContainer;
