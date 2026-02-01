import { MdClose } from "react-icons/md";
import { FiDelete } from "react-icons/fi";
import { IoEnter } from "react-icons/io5";
import { formatCurrency } from "../utils/formatUtils";
import { concepts, darkTheme } from "../utils/constants";
import { Select } from "antd";
import { useTheme } from "../contexts/ThemeContext";

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
  title,
}: any) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();

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
          <div className={`w-[40vh] h-max mt-[20vh] p-8 rounded-md shadow-md relative  ${themeStyles[theme].tailwindcss.modal}`}>
            {/* Icono de cerrar en la esquina superior derecha */}
            <button
              className="absolute top-4 right-4"
              onClick={closeModal}
            >
              <MdClose className="text-2xl" />
            </button>

            <h2 className="text-lg font-bold mb-4">{title}</h2>

            <input
              type="text"
              className={`w-[26vh] h-[6vh] p-4 rounded-md mb-5 text-2xl ${themeStyles[theme].tailwindcss.inputText}`}
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
                <label className="mr-2">Concepto:</label>
                <Select
                  value={concept}
                  className={themeStyles[theme].classNameSelector}
                  dropdownStyle={{
                    ...themeStyles[theme].dropdownStylesCustom,
                    width: 160,
                  }}
                  popupClassName={themeStyles[theme].classNameSelectorItem}
                  style={{ width: 160 }}
                  onSelect={(value: any) => setConcept(value)}
                  options={concepts.map((data: any) => ({
                    value: data.value,
                    label: data.description,
                  }))}
                />
              </div>
            )}

            <div className="h-auto ">
              {elements.map((element: any, idx: number) => {
                return (
                  <div className="flex flex-wrap gap-2 mb-2" key={idx}>
                    {element.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className={`w-[8vh] h-[6vh] p-2 bg-gray-600 text-white text-center transition-all hover:bg-[#484E55] hover:cursor-pointer flex items-center justify-center text-2xl font-bold select-none`}
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
