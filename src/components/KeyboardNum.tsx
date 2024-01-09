import { MdClose } from "react-icons/md";
import { FiDelete } from "react-icons/fi";
import { IoEnter } from "react-icons/io5";
import { formatCurrency } from "../utils/formatUtils";

const KeyboardNum = ({
  isModalKeyboardNumOpen,
  devolutionModeActive,
  manualPrice,
  itemIdFocusForQuantity,
  quantityForItem,
  handleManualPrice,
  closeModal,
  handleQuantityByItem,
}: any) => {
  const title = itemIdFocusForQuantity
    ? "Agregar Cantidad al Item"
    : devolutionModeActive
    ? "Añadir precio dev manual"
    : "Añadir precio manual";

  const elements = [
    [{ value: 1 }, { value: 2 }, { value: 3 }],
    [{ value: 4 }, { value: 5 }, { value: 6 }],
    [{ value: 7 }, { value: 8 }, { value: 9 }],
    [
      { value: 0 },
      { value: <FiDelete />, action: "deleteLast" },
      { value: <IoEnter />, action: "addPrice" },
    ],
  ];

  return (
    <>
      {isModalKeyboardNumOpen && (
        <div className="fixed inset-0 bg-[#252525] bg-opacity-70 flex justify-center">
          {/* Contenido del modal */}
          <div className="w-[40vh] h-[55vh] mt-10 bg-gray-800 border border-[#000000] p-8 rounded shadow-md relative">
            {/* Icono de cerrar en la esquina superior derecha */}
            <button
              className="absolute top-4 right-4 text-white"
              onClick={closeModal}
            >
              <MdClose className="text-2xl" />
            </button>

            <h2 className="text-white text-lg font-bold mb-4">{title}</h2>

            <input
              type="text"
              className="w-[26vh] h-[6vh] p-4 border border-[#484E55] rounded-md mb-5 text-2xl"
              value={`${
                Boolean(itemIdFocusForQuantity)
                  ? quantityForItem
                  : "$" + formatCurrency(manualPrice)
              }`}
              readOnly
            />

            <div className="h-auto ">
              {elements.map((element: any, idx: number) => {
                return (
                  <div className="flex flex-wrap gap-2 mb-2" key={idx}>
                    {element.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className={`w-[8vh] h-[6vh] p-2 border border-[#484E55] bg-[#333333] text-white text-center transition-all hover:bg-[#484E55] hover:cursor-pointer flex items-center justify-center text-2xl font-bold select-none`}
                        onClick={() =>
                          Boolean(itemIdFocusForQuantity)
                            ? handleQuantityByItem(item)
                            : handleManualPrice(item)
                        }
                      >
                        {item.value}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KeyboardNum;
