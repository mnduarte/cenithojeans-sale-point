import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import Spinner from "../../components/Spinner";
import { useTheme } from "../../contexts/ThemeContext";
import { CASHIER_COLORS, getTextColorForBackground } from "../../utils/cashierColors";

interface Store {
  name: string;
}

interface CashierFormProps {
  itemSelected: any;
  setItemSelected: (item: any) => void;
  onAddCashier: (cashier: any) => Promise<void>;
  onUpdateCashier: (cashier: any) => Promise<void>;
  onDeleteCashier: (id: string) => Promise<void>;
  isLoading: boolean;
  stores: Store[];
  totalPositions: number;
}

const CashierForm = ({
  itemSelected,
  setItemSelected,
  onAddCashier,
  onUpdateCashier,
  onDeleteCashier,
  isLoading,
  stores,
  totalPositions,
}: CashierFormProps) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();

  const initialValues = {
    id: "",
    name: "",
    store: "",
    color: "",
    position: totalPositions,
  };

  const [isNewCashier, setIsNewCashier] = useState(true);
  const [cashierValues, setCashierValues] = useState(initialValues);

  const titleForm = `${isNewCashier ? "Agregar" : "Editar"} Cajero`;

  const handleAction = async (action: any) => {
    await action(cashierValues);
    setCashierValues({ ...initialValues, position: totalPositions });
    setIsNewCashier(true);
    setItemSelected({});
  };

  useEffect(() => {
    if (itemSelected?.id) {
      setCashierValues(itemSelected);
      setIsNewCashier(false);
    }
  }, [itemSelected]);

  useEffect(() => {
    if (isNewCashier) {
      setCashierValues((prev) => ({ ...prev, position: totalPositions }));
    }
  }, [totalPositions, isNewCashier]);

  return (
    <div className="p-4 rounded-md">
      <h3 className="text-2xl mb-4 flex items-center justify-center gap-2">
        <label>{titleForm}</label>
        {!isNewCashier && (
          <div
            className="w-[4vh] h-[4vh] bg-[#007c2f] text-white hover:cursor-pointer hover:bg-[#006b29] flex items-center justify-center rounded-md"
            onClick={() => {
              setCashierValues({ ...initialValues, position: totalPositions });
              setIsNewCashier(true);
              setItemSelected({});
            }}
          >
            <FaPlus className="text-2xl" />
          </div>
        )}
      </h3>

      <div className="mb-4">
        <label className="block mb-2">Nombre:</label>
        <input
          type="text"
          value={cashierValues.name}
          onChange={(e) =>
            setCashierValues({ ...cashierValues, name: e.target.value })
          }
          className={`p-1 rounded-md w-full ${themeStyles[theme].tailwindcss.inputText}`}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Sucursal:</label>
        <select
          value={cashierValues.store}
          onChange={(e) =>
            setCashierValues({ ...cashierValues, store: e.target.value })
          }
          className={`p-1 rounded-md w-full ${themeStyles[theme].tailwindcss.inputText}`}
        >
          <option value="">Seleccione sucursal</option>
          {stores.map((store) => (
            <option key={store.name} value={store.name}>
              {store.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2">Color:</label>
        <select
          value={cashierValues.color}
          onChange={(e) =>
            setCashierValues({ ...cashierValues, color: e.target.value })
          }
          className={`p-1 rounded-md w-full ${themeStyles[theme].tailwindcss.inputText}`}
          style={{
            backgroundColor: cashierValues.color || undefined,
            color: cashierValues.color
              ? getTextColorForBackground(cashierValues.color)
              : undefined,
          }}
        >
          <option value="">Seleccione color</option>
          {CASHIER_COLORS.map((color) => (
            <option
              key={color.value}
              value={color.value}
              style={{
                backgroundColor: color.value,
                color: color.textColor,
              }}
            >
              {color.label}
            </option>
          ))}
        </select>
        {/* Preview del color */}
        {cashierValues.color && (
          <div
            className="mt-2 p-2 rounded-md text-center"
            style={{
              backgroundColor: cashierValues.color,
              color: getTextColorForBackground(cashierValues.color),
            }}
          >
            Vista previa: {cashierValues.name || "Nombre del cajero"}
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block mb-2">Posición:</label>
        <input
          type="number"
          min="0"
          value={cashierValues.position}
          onChange={(e) =>
            setCashierValues({
              ...cashierValues,
              position: parseInt(e.target.value) || 0,
            })
          }
          className={`p-1 rounded-md w-full ${themeStyles[theme].tailwindcss.inputText}`}
        />
      </div>

      <div className="flex justify-between items-center mt-4">
        {isNewCashier ? (
          <button
            className={`${
              !cashierValues.name || !cashierValues.store || !cashierValues.color
                ? "bg-gray-600"
                : "bg-[#007c2f] hover:opacity-80 transition-opacity"
            } text-white px-4 py-2 rounded-md flex items-center mx-auto`}
            disabled={
              !cashierValues.name || !cashierValues.store || !cashierValues.color
            }
            onClick={() => !isLoading && handleAction(onAddCashier)}
          >
            <FaPlus className="mr-2" /> Agregar Cajero{" "}
            {isLoading && (
              <div className="ml-2">
                <Spinner />
              </div>
            )}
          </button>
        ) : (
          <>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:opacity-80 transition-opacity flex items-center mx-auto"
              onClick={() =>
                !isLoading && handleAction(() => onDeleteCashier(cashierValues.id))
              }
            >
              Eliminar
              {isLoading && (
                <div className="ml-2">
                  <Spinner />
                </div>
              )}
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:opacity-80 transition-opacity flex items-center mx-auto"
              onClick={() => !isLoading && handleAction(onUpdateCashier)}
            >
              Guardar
              {isLoading && (
                <div className="ml-2">
                  <Spinner />
                </div>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CashierForm;
