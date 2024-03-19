import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import Spinner from "./Spinner";
import { Select } from "antd";
import { darkTheme } from "../utils/constants";
import { useTheme } from "../contexts/ThemeContext";

const EmployeeForm = ({
  itemSelected,
  setItemSelected,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  isLoading,
  stores,
}: any) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();
  const initialValues = {
    id: "",
    name: "",
    store: "",
    active: true,
  };
  const [isNewEmployee, setIsNewEmployee] = useState(true);
  const [employeeValues, setEmployeeValues] = useState(initialValues);

  const titleForm = `${isNewEmployee ? "Carga de" : "Editar"} empleado`;

  const handleAction = (action: any) => {
    setEmployeeValues(initialValues);
    setIsNewEmployee(true);
    action(employeeValues);
  };

  useEffect(() => {
    if (itemSelected.id) {
      setEmployeeValues(itemSelected);
      setIsNewEmployee(false);
    }
  }, [itemSelected]);

  return (
    <div className="p-4 rounded-md">
      <h3 className="text-2xl mb-4 flex items-center justify-center gap-2">
        <label>{titleForm}</label>
        {!isNewEmployee && (
          <div
            className="w-1/5 h-[4vh] bg-[#007c2f] p-1 hover:cursor-pointer hover:bg-[#006b29] flex items-center justify-center rounded-md"
            onClick={() => {
              setEmployeeValues(initialValues);
              setIsNewEmployee(true);
              setItemSelected({});
            }}
          >
            <FaPlus className="text-2xl text-white" />
          </div>
        )}
      </h3>

      <div className="mb-4">
        <label className="block mb-2">Nombre:</label>
        <input
          type="text"
          value={employeeValues.name}
          onChange={(e) =>
            setEmployeeValues({ ...employeeValues, name: e.target.value })
          }
          className={`p-1 rounded-md w-full ${themeStyles[theme].tailwindcss.inputText}`}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Sucursal:</label>

        <Select
          value={employeeValues.store}
          className={`${themeStyles[theme].classNameSelector} w-full`}
          dropdownStyle={themeStyles[theme].dropdownStylesCustom}
          popupClassName={themeStyles[theme].classNameSelectorItem}
          onSelect={(value: any) =>
            setEmployeeValues({ ...employeeValues, store: value })
          }
          options={stores.map((data: any) => ({
            value: data.name,
            label: data.name,
          }))}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={employeeValues.active}
            onChange={({ target }) =>
              setEmployeeValues({ ...employeeValues, active: target.checked })
            }
            className="mr-2"
          />
          <span>Activo</span>
        </label>
      </div>

      <div className="flex justify-between items-center mt-4">
        {isNewEmployee ? (
          <button
            className={`${
              !Boolean(employeeValues.name) || !Boolean(employeeValues.store)
                ? "bg-gray-600"
                : "bg-[#007c2f] hover:opacity-80 transition-opacity"
            } text-white px-4 py-2 rounded-md flex items-center mx-auto`}
            disabled={
              !Boolean(employeeValues.name) || !Boolean(employeeValues.store)
            }
            onClick={() => !isLoading && handleAction(onAddEmployee)}
          >
            <FaPlus className="mr-2" /> Agregar Empleado
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
              onClick={() => !isLoading && handleAction(onDeleteEmployee)}
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
              onClick={() => !isLoading && onUpdateEmployee(employeeValues)}
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

export default EmployeeForm;
