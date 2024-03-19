import { FaTimes, FaPlus, FaMinus } from "react-icons/fa";
import { MdCleaningServices, MdPointOfSale } from "react-icons/md";
import { formatCurrency } from "../utils/formatUtils";
import { Price, PriceSelected } from "../types";
import { mappingConceptWithIcon } from "../utils/mappings";
import { useTheme } from "../contexts/ThemeContext";

const ShoppingPrices = ({
  prices,
  removeProductSelected,
  handleQuantityByPrice,
  handleOpenKeyboardNum,
  increaseQuantity,
  decrementQuantity,
  isDevolution,
}: any) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();

  const styles = { border: "border-[#1BA1E2]" };

  if (isDevolution) {
    styles.border = "border-red-500";
  }

  const withBorder = false;

  return (
    <>
      {prices.map((item: any, idx: any) => (
        <div
          key={idx}
          className={` ${withBorder && "border"} ${
            item.concept ? "border-yellow-600" : styles.border
          }  text-center flex items-center justify-center mb-1 `}
        >
          <div
            className={`w-1/6 h-12 border-r ${
              item.concept ? "border-yellow-600" : styles.border
            } flex items-center justify-center hover:bg-red-500 hover:cursor-pointer hover:text-white`}
            onClick={() => removeProductSelected(item.id, isDevolution)}
          >
            <FaTimes />
          </div>

          <div className="w-3/5 h-12 pr-2 flex items-center justify-end select-none">
            <input
              type="text"
              className={`w-[5vh] p-2 border border-[#484E55] rounded-md mr-2  ${themeStyles[theme].tailwindcss.inputText}`}
              value={item.quantity}
              onChange={(e) => handleQuantityByPrice(e, item.id, isDevolution)}
              onFocus={() => handleOpenKeyboardNum(item.id)}
            />
            x {formatCurrency(item.price)}
          </div>
          <div
            className={`w-2/5 h-12 pr-1 border-l ${
              item.concept ? "border-yellow-600" : styles.border
            } flex items-center justify-end select-none`}
          >
            {item.concept && mappingConceptWithIcon[item.concept].icon} $
            {formatCurrency(`${item.quantity * item.price}`)}
          </div>

          <div className="w-1/6 h-12 flex flex-col">
            <div
              className={`h-1/2 flex items-center justify-center ${
                withBorder && "border"
              } border-[#484E55] hover:bg-[#484E55] hover:cursor-pointer`}
              onClick={() => increaseQuantity(item.id, isDevolution)}
            >
              <FaPlus />
            </div>
            <div
              className={`h-1/2 flex items-center justify-center ${
                withBorder && "border"
              } border-[#484E55] hover:bg-[#484E55] hover:cursor-pointer`}
              onClick={() => decrementQuantity(item.id, isDevolution)}
            >
              <FaMinus />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

const ShoppingCartContainer = ({
  prices,
  manualPrice,
  setManualPrice,
  pricesSelected,
  setPricesSelected,
  totalPrice,
  totalItems,
  devolutionModeActive,
  devolutionPricesSelected,
  setDevolutionPricesSelected,
  totalDevolutionItems,
  openModalSale,
  setIsModalKeyboardNumOpen,
  handleQuantityByPrice,
  handleOpenKeyboardNum,
}: any) => {
  const setPricesItems = devolutionModeActive
    ? setDevolutionPricesSelected
    : setPricesSelected;

  const {
    state: { theme, themeStyles },
  } = useTheme();

  const addManualPrice = () => {
    if (manualPrice.length) {
      setPricesItems((items: any) => {
        const maxId = Math.max(
          ...items.map((item: PriceSelected) => item.id),
          ...prices.map((item: Price) => item.id)
        );

        const newItem = {
          id: maxId + 1,
          price: manualPrice,
          quantity: 1,
          active: true,
        };
        return [...items, newItem];
      });
      setManualPrice("");
    }
  };

  const removeProductSelected = (itemId: number, isDevolution: boolean) => {
    const setPricesItems = isDevolution
      ? setDevolutionPricesSelected
      : setPricesSelected;

    setPricesItems((items: any) =>
      items.filter(({ id }: any) => itemId !== id)
    );
  };

  const increaseQuantity = (itemId: number, isDevolution: boolean) => {
    const pricesItems = isDevolution
      ? devolutionPricesSelected
      : pricesSelected;
    const setPricesItems = isDevolution
      ? setDevolutionPricesSelected
      : setPricesSelected;

    const productsUpdated = pricesItems.map((item: any) => {
      return itemId === item.id
        ? { ...item, quantity: item.quantity + 1 }
        : item;
    });

    setPricesItems(productsUpdated);
  };

  const decrementQuantity = (itemId: number, isDevolution: boolean) => {
    const pricesItems = isDevolution
      ? devolutionPricesSelected
      : pricesSelected;
    const setPricesItems = isDevolution
      ? setDevolutionPricesSelected
      : setPricesSelected;

    const productsUpdated = pricesItems.map((item: any) => {
      return itemId === item.id && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item;
    });

    setPricesItems(productsUpdated);
  };

  const onCleanAllProductsSeleted = () => {
    setPricesSelected([]);
    setDevolutionPricesSelected([]);
  };

  return (
    <>
      <div
        className={`h-[6vh] p-2 border ${themeStyles[theme].tailwindcss.border} text-center flex items-center justify-center`}
      >
        <div
          className={`w-[40vh] h-[5vh] p-2 border ${
            devolutionModeActive ? "border-red-500" : "border-[#1b78e2]"
          } text-center transition-all ${
            themeStyles[theme].tailwindcss.priceBox
          } hover:cursor-pointer flex items-center justify-center text-base select-none`}
          onClick={() => setIsModalKeyboardNumOpen(true)}
        >
          {devolutionModeActive
            ? "Añadir precio dev manual"
            : "Añadir precio manual"}
        </div>
      </div>
      {/* Seccion de Items */}
      <div>
        <div
          className={`${
            Boolean(devolutionPricesSelected.length) ? "h-[44vh]" : "h-[69vh]"
          } p-2 border-x ${
            themeStyles[theme].tailwindcss.border
          } overflow-hidden overflow-y-auto`}
        >
          <ShoppingPrices
            prices={pricesSelected}
            removeProductSelected={removeProductSelected}
            handleQuantityByPrice={handleQuantityByPrice}
            handleOpenKeyboardNum={handleOpenKeyboardNum}
            increaseQuantity={increaseQuantity}
            decrementQuantity={decrementQuantity}
          />
        </div>

        <div
          className={`h-[3vh] relative p-2 border ${themeStyles[theme].tailwindcss.border} text-center flex items-center justify-center select-none`}
        >
          Total Items: {totalItems}
        </div>
      </div>

      {/* Seccion de Devolucion */}
      {Boolean(devolutionPricesSelected.length) && (
        <>
          <div
            className={`h-[22vh] p-2 border-x ${themeStyles[theme].tailwindcss.border} overflow-hidden overflow-y-auto`}
          >
            <ShoppingPrices
              prices={devolutionPricesSelected}
              removeProductSelected={removeProductSelected}
              handleQuantityByPrice={handleQuantityByPrice}
              handleOpenKeyboardNum={handleOpenKeyboardNum}
              increaseQuantity={increaseQuantity}
              decrementQuantity={decrementQuantity}
              isDevolution={true}
            />
          </div>

          <div
            className={`h-[3vh] relative p-2 border ${themeStyles[theme].tailwindcss.border}  text-center flex items-center justify-center select-none`}
          >
            Total Items: {totalDevolutionItems}
          </div>
        </>
      )}

      <div
        className={`h-[5vh] relative p-2 border-x ${themeStyles[theme].tailwindcss.border} text-center flex items-center justify-center text-xl font-bold select-none`}
      >
        Total: ${formatCurrency(totalPrice)}
      </div>
      <div
        className={`h-[6vh] relative p-2 border ${themeStyles[theme].tailwindcss.border} text-center flex items-center justify-center gap-2`}
      >
        <div
          className="h-[4vh] text-white bg-red-600 p-1 hover:cursor-pointer hover:bg-[#d3341b] flex items-center justify-center"
          onClick={onCleanAllProductsSeleted}
        >
          <MdCleaningServices className="text-2xl" />
        </div>

        <div
          className={`w-3/4 h-[5vh] ${
            Boolean(pricesSelected.length) ||
            Boolean(devolutionPricesSelected.length)
              ? "bg-green-600 hover:cursor-pointer hover:bg-[#006b29]"
              : "bg-gray-600"
          } text-white text-lg flex items-center justify-center select-none`}
          onClick={() =>
            (Boolean(pricesSelected.length) ||
              Boolean(devolutionPricesSelected.length)) &&
            openModalSale()
          }
        >
          <MdPointOfSale className="text-2xl" /> Vender
        </div>
      </div>
    </>
  );
};

export default ShoppingCartContainer;
