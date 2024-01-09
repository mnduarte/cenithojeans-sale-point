import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import Spinner from "./Spinner";

const EmployeeForm = ({
  itemSelected,
  setItemSelected,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  isLoading,
}: any) => {
  const initialValues = {
    id: "",
    name: "",
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
      <h3 className="text-2xl text-white mb-4 flex items-center justify-center gap-2">
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
            <FaPlus className="text-2xl" />
          </div>
        )}
      </h3>

      <div className="mb-4">
        <label className="block text-white mb-2">Nombre:</label>
        <input
          type="text"
          value={employeeValues.name}
          onChange={(e) =>
            setEmployeeValues({ ...employeeValues, name: e.target.value })
          }
          className="bg-gray-700 text-white p-2 rounded-md w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block text-white mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={employeeValues.active}
            onChange={({ target }) =>
              setEmployeeValues({ ...employeeValues, active: target.checked })
            }
            className="mr-2"
          />
          <span className="text-white">Activo</span>
        </label>
      </div>

      <div className="flex justify-between items-center mt-4">
        {isNewEmployee ? (
          <button
            className={`${
              !Boolean(employeeValues.name)
                ? "bg-[#333333]"
                : "bg-[#007c2f] hover:opacity-80 transition-opacity"
            } text-white px-4 py-2 rounded-md flex items-center mx-auto`}
            disabled={!Boolean(employeeValues.name)}
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
