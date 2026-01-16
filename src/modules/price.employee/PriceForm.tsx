import { useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import Spinner from "../../components/Spinner";
import { useTheme } from "../../contexts/ThemeContext";

const PriceForm = ({
  itemSelected,
  setItemSelected,
  onAddPrice,
  onUpdatePrice,
  onDeletePrice,
  isLoading,
  initialValues,
  isNewPrice,
  setIsNewPrice,
  priceValues,
  setPriceValues,
  currentType,
}: any) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();
  const titleForm = `${isNewPrice ? "Carga de" : "Editar"} precio`;
  const typeLabel = currentType === "jeans" ? "Jeans" : "Remera";
  const typeColor = currentType === "jeans" ? "text-blue-400" : "text-green-400";

  const handleAction = (action: any) => {
    setPriceValues(initialValues);
    setIsNewPrice(true);
    action(priceValues);
  };

  const handlePrice = (event: any) => {
    const inputValue = event.target.value;
    if (/^\d*$/.test(inputValue)) {
      setPriceValues({ ...priceValues, price: inputValue });
    }
  };

  useEffect(() => {
    if (itemSelected.id) {
      setPriceValues({
        ...itemSelected,
        type: itemSelected.type || currentType,
      });
      setIsNewPrice(false);
    }
  }, [itemSelected]);

  // Actualizar el tipo cuando cambia el currentType (desde sub-tab)
  useEffect(() => {
    if (isNewPrice) {
      setPriceValues((prev: any) => ({
        ...prev,
        type: currentType,
      }));
    }
  }, [currentType, isNewPrice]);

  return (
    <div className="p-4 rounded-md">
      <h3 className="text-2xl mb-4 flex items-center justify-center gap-2">
        <label>{titleForm}</label>
        <span className={`font-bold ${typeColor}`}>
          ({typeLabel})
        </span>
        {!isNewPrice && (
          <div
            className="w-[4vh] h-[4vh] bg-[#007c2f] text-white hover:cursor-pointer hover:bg-[#006b29] flex items-center justify-center rounded-md"
            onClick={() => {
              setPriceValues({ ...initialValues, type: currentType });
              setIsNewPrice(true);
              setItemSelected({});
            }}
          >
            <FaPlus className="text-2xl" />
          </div>
        )}
      </h3>

      <div className="mb-4">
        <label className="block mb-2">Precio:</label>
        <input
          type="text"
          value={priceValues.price}
          onChange={handlePrice}
          className={`p-1 rounded-md w-full ${themeStyles[theme].tailwindcss.inputText}`}
        />
      </div>

      {/* Indicador de tipo (solo lectura) */}
      <div className="mb-4">
        <label className="block mb-2">Tipo:</label>
        <div
          className={`p-2 rounded-md text-center font-medium ${
            currentType === "jeans"
              ? "bg-blue-600/20 border border-blue-600 text-blue-400"
              : "bg-green-600/20 border border-green-600 text-green-400"
          }`}
        >
          {currentType === "jeans" ? (
            <>
              <span className="font-bold">J</span> - Jeans
            </>
          ) : (
            <>
              <span className="font-bold">R</span> - Remera
            </>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          El tipo se define según la pestaña seleccionada
        </p>
      </div>

      <div className="mb-4">
        <label className="block mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={priceValues.active}
            onChange={({ target }) =>
              setPriceValues({ ...priceValues, active: target.checked })
            }
            className="mr-2"
          />
          <span>Activo</span>
        </label>
      </div>

      <div className="flex justify-between items-center mt-4">
        {isNewPrice ? (
          <button
            className={`${
              !Boolean(priceValues.price)
                ? "bg-gray-600"
                : "bg-[#007c2f] hover:opacity-80 transition-opacity"
            } text-white px-4 py-2 rounded-md flex items-center mx-auto`}
            disabled={!Boolean(priceValues.price)}
            onClick={() =>
              !isLoading &&
              handleAction(() =>
                onAddPrice({ ...priceValues, type: currentType })
              )
            }
          >
            <FaPlus className="mr-2" /> Agregar Precio{" "}
            {isLoading && (
              <div className="ml-2">
                <Spinner />
              </div>
            )}
          </button>
        ) : (
          <>
            <button
              className={`bg-red-500 text-white px-4 py-2 rounded-md hover:opacity-80 transition-opacity flex items-center mx-auto`}
              onClick={() => !isLoading && handleAction(onDeletePrice)}
            >
              Eliminar
              {isLoading && (
                <div className="ml-2">
                  <Spinner />
                </div>
              )}
            </button>
            <button
              className={`bg-blue-500 text-white px-4 py-2 rounded-md hover:opacity-80 transition-opacity flex items-center mx-auto`}
              onClick={() =>
                !isLoading && onUpdatePrice({ ...priceValues, type: currentType })
              }
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

export default PriceForm;
