import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import Spinner from "../../components/Spinner";
import { Select } from "antd";
import { useTheme } from "../../contexts/ThemeContext";

const AccountForTransferForm = ({
  itemSelected,
  setItemSelected,
  onAddAccountTransfer,
  onUpdateAccountTransfer,
  onDeleteAccountTransfer,
  isLoading,
  stores,
  totalPositions,
}: any) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();
  const initialValues = {
    id: "",
    name: "",
    store: "",
    position: null,
    active: true,
    activeForCost: false,
  };
  const [isNewAccountTransfer, setIsNewAccountTransfer] = useState(true);
  const [accountTransferValues, setAccountTransfer] = useState(initialValues);

  const titleForm = `${isNewAccountTransfer ? "Carga de" : "Editar"} cuenta`;

  const handleAction = (action: any) => {
    action(accountTransferValues);
    setAccountTransfer(initialValues);
    setIsNewAccountTransfer(true);
  };

  useEffect(() => {
    if (itemSelected.id) {
      setAccountTransfer(itemSelected);
      setIsNewAccountTransfer(false);
    }
  }, [itemSelected]);

  return (
    <div className="p-4 rounded-md">
      <h3 className="text-2xl mb-4 flex items-center justify-center gap-2">
        <label>{titleForm}</label>
        {!isNewAccountTransfer && (
          <div
            className="w-1/5 h-[4vh] bg-[#007c2f] p-1 hover:cursor-pointer hover:bg-[#006b29] flex items-center justify-center rounded-md"
            onClick={() => {
              setAccountTransfer(initialValues);
              setIsNewAccountTransfer(true);
              setItemSelected({});
            }}
          >
            <FaPlus className="text-2xl text-white" />
          </div>
        )}
      </h3>

      <div className="mb-4">
        <label className="block mb-2">Nombre de Cuenta:</label>
        <input
          type="text"
          value={accountTransferValues.name}
          onChange={(e) =>
            setAccountTransfer({ ...accountTransferValues, name: e.target.value })
          }
          className={`p-1 rounded-md w-full ${themeStyles[theme].tailwindcss.inputText}`}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Sucursal:</label>

        <Select
          value={accountTransferValues.store}
          className={`${themeStyles[theme].classNameSelector} w-full`}
          dropdownStyle={themeStyles[theme].dropdownStylesCustom}
          popupClassName={themeStyles[theme].classNameSelectorItem}
          onSelect={(value: any) =>
            setAccountTransfer({ ...accountTransferValues, store: value })
          }
          options={stores.map((data: any) => ({
            value: data.name,
            label: data.name,
          }))}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Posicion:</label>

        <Select
          value={accountTransferValues.position}
          className={`${themeStyles[theme].classNameSelector} w-full`}
          dropdownStyle={themeStyles[theme].dropdownStylesCustom}
          popupClassName={themeStyles[theme].classNameSelectorItem}
          onSelect={(value: any) =>
            setAccountTransfer({ ...accountTransferValues, position: value })
          }
          options={Array.from(
            { length: totalPositions + 1 },
            (_, index) => index
          ).map((data: any) => ({
            value: data,
            label: data,
          }))}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={accountTransferValues.active}
            onChange={({ target }) =>
              setAccountTransfer({ ...accountTransferValues, active: target.checked })
            }
            className="mr-2"
          />
          <span>Activo</span>
        </label>
      </div>

      <div className="flex justify-between items-center mt-4">
        {isNewAccountTransfer ? (
          <button
            className={`${
              !Boolean(accountTransferValues.name) || !Boolean(accountTransferValues.store)
                ? "bg-gray-600"
                : "bg-[#007c2f] hover:opacity-80 transition-opacity"
            } text-white px-4 py-2 rounded-md flex items-center mx-auto`}
            disabled={
              !Boolean(accountTransferValues.name) || !Boolean(accountTransferValues.store)
            }
            onClick={() => !isLoading && handleAction(onAddAccountTransfer)}
          >
            <FaPlus className="mr-2" /> Agregar Cuenta
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
              onClick={() => !isLoading && handleAction(onDeleteAccountTransfer)}
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
              onClick={() => !isLoading && onUpdateAccountTransfer(accountTransferValues)}
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

export default AccountForTransferForm;
