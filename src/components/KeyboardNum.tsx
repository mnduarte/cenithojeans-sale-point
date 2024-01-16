import { MdClose } from "react-icons/md";
import { FiDelete } from "react-icons/fi";
import { IoEnter } from "react-icons/io5";
import { formatCurrency } from "../utils/formatUtils";

const KeyboardNum = ({
  isModalKeyboardNumOpen,
  manualNum,
  itemIdFocusForQuantity,
  quantityForItem,
  handleManualNum,
  closeModal,
  handleQuantityByItem,
  isItemPrice,
  concept,
  setConcept,
  title
}: any) => {

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
                isItemPrice
                  ? Boolean(itemIdFocusForQuantity)
                    ? quantityForItem
                    : "$" + formatCurrency(manualNum)
                  : manualNum
              }`}
              readOnly
            />

            {isItemPrice && !itemIdFocusForQuantity && (
              <div className="mb-4">
                <label className="mr-2 text-white">Concepto:</label>
                <select
                  className="p-1 border border-[#484E55] rounded-md"
                  onChange={(e: any) => setConcept(e.target.value)}
                  value={concept}
                >
                  <option value="" className="py-2" disabled hidden>
                    Sin concepto
                  </option>
                  <option value="bolsas" className="py-2">
                    Bolsas
                  </option>
                  <option value="envio" className="py-2">
                    Envío
                  </option>
                  <option value="recargoPorMenor" className="py-2">
                    Recargo por menor
                  </option>
                </select>
              </div>
            )}

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
                            : handleManualNum(item, concept)
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
