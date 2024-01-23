import { FaTimes, FaPlus, FaMinus } from "react-icons/fa";
import { MdCleaningServices, MdPointOfSale } from "react-icons/md";
import { formatCurrency } from "../utils/formatUtils";
import { Price, PriceSelected } from "../types";
import { mappingConceptWithIcon } from "../utils/mappings";

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
      <div className="h-[6vh] p-2 border border-[#484E55] text-center flex items-center justify-center">
        <div
          className={`w-[40vh] h-[5vh] p-2 border ${
            devolutionModeActive ? "border-red-500" : "border-[#1b78e2]"
          } bg-[#333333] text-white text-center transition-all hover:bg-[#484E55] hover:cursor-pointer flex items-center justify-center text-base select-none`}
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
            Boolean(devolutionPricesSelected.length) ? "h-[42vh]" : "h-[67vh]"
          } p-2 border border-[#484E55] overflow-hidden overflow-y-auto`}
        >
          {pricesSelected.map((item: any, idx: any) => (
            <div
              key={idx}
              className={` border ${
                item.concept ? "border-yellow-600" : "border-[#1BA1E2]"
              } bg-[#333333] text-white text-center flex items-center justify-center mb-2 `}
            >
              <div
                className={`w-1/6 h-12 border-r ${
                  item.concept ? "border-yellow-600" : "border-[#1BA1E2]"
                } flex items-center justify-center hover:bg-red-500 hover:cursor-pointer`}
                onClick={() => removeProductSelected(item.id, false)}
              >
                <FaTimes />
              </div>
              <div className="w-3/5 h-12 pr-2 flex items-center justify-end select-none">
                <input
                  type="text"
                  className="w-[5vh] p-2 border border-[#484E55] rounded-md mr-2"
                  value={item.quantity}
                  onChange={(e) => handleQuantityByPrice(e, item.id, false)}
                  onFocus={() => handleOpenKeyboardNum(item.id)}
                />
                x {formatCurrency(item.price)}
              </div>
              <div className="w-2/5 h-12 pr-1 border-l border-[#484E55] flex items-center justify-end select-none">
                {item.concept && mappingConceptWithIcon[item.concept].icon} $
                {formatCurrency(`${item.quantity * item.price}`)}
              </div>

              <div className="w-1/6 h-12 flex flex-col">
                <div
                  className="h-1/2 flex items-center justify-center border border-[#484E55] hover:bg-[#484E55] hover:cursor-pointer"
                  onClick={() => increaseQuantity(item.id, false)}
                >
                  <FaPlus />
                </div>
                <div
                  className="h-1/2 flex items-center justify-center border border-[#484E55] hover:bg-[#484E55] hover:cursor-pointer"
                  onClick={() => decrementQuantity(item.id, false)}
                >
                  <FaMinus />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-[3vh] relative p-2 border border-[#484E55] text-white text-center flex items-center justify-center select-none">
          Total Items: {totalItems}
        </div>
      </div>

      {/* Seccion de Devolucion */}
      {Boolean(devolutionPricesSelected.length) && (
        <div>
          <div
            className={`h-[22vh] p-2 border border-[#484E55] overflow-hidden overflow-y-auto`}
          >
            {devolutionPricesSelected.map((item: any, idx: any) => (
              <div
                key={idx}
                className={` border ${
                  item.concept ? "border-yellow-600" : "border-red-500"
                }  bg-[#333333] text-white text-center flex items-center justify-center mb-2 `}
              >
                <div
                  className={`w-1/6 h-12 border-r ${
                    item.concept ? "border-yellow-600" : "border-red-500"
                  } flex items-center justify-center hover:bg-red-500 hover:cursor-pointer`}
                  onClick={() => removeProductSelected(item.id, true)}
                >
                  <FaTimes />
                </div>

                <div className="w-3/5 h-12 pr-2 flex items-center justify-end select-none">
                  <input
                    type="text"
                    className="w-[5vh] p-2 border border-[#484E55] rounded-md mr-2"
                    value={item.quantity}
                    onChange={(e) => handleQuantityByPrice(e, item.id, true)}
                    onFocus={() => handleOpenKeyboardNum(item.id)}
                  />
                  x {formatCurrency(item.price)}
                </div>
                <div className="w-2/5 h-12 pr-1 border-l border-[#484E55] flex items-center justify-end select-none">
                  {item.concept && mappingConceptWithIcon[item.concept].icon} $
                  {formatCurrency(`${item.quantity * item.price}`)}
                </div>

                <div className="w-1/6 h-12 flex flex-col">
                  <div
                    className="h-1/2 flex items-center justify-center border border-[#484E55] hover:bg-[#484E55] hover:cursor-pointer"
                    onClick={() => increaseQuantity(item.id, true)}
                  >
                    <FaPlus />
                  </div>
                  <div
                    className="h-1/2 flex items-center justify-center border border-[#484E55] hover:bg-[#484E55] hover:cursor-pointer"
                    onClick={() => decrementQuantity(item.id, true)}
                  >
                    <FaMinus />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="h-[3vh] relative p-2 border border-[#484E55]  text-white text-center flex items-center justify-center select-none">
            Total Items: {totalDevolutionItems}
          </div>
        </div>
      )}

      <div className="h-[5vh] relative p-2 border border-[#484E55]  text-white text-center flex items-center justify-center text-xl font-bold select-none">
        Total: ${formatCurrency(totalPrice)}
      </div>
      <div className="h-[6vh] relative p-2 border border-[#484E55] text-center flex items-center justify-center gap-2">
        <div
          className="h-[4vh] bg-[#ef492f] p-1 hover:cursor-pointer hover:bg-[#d3341b] flex items-center justify-center"
          onClick={onCleanAllProductsSeleted}
        >
          <MdCleaningServices className="text-2xl" />
        </div>

        <div
          className={`w-3/4 h-[5vh] ${
            Boolean(pricesSelected.length) ||
            Boolean(devolutionPricesSelected.length)
              ? "bg-[#007c2f] hover:cursor-pointer hover:bg-[#006b29]"
              : "bg-[#333333]"
          } text-lg flex items-center justify-center select-none`}
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
