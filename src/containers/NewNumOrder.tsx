import { useState } from "react";
import { MdClose } from "react-icons/md";
import KeyboardNum from "../components/KeyboardNum";
import { employeeActions, useEmployee } from "../contexts/EmployeeContext";
import Spinner from "../components/Spinner";
import { useUser } from "../contexts/UserContext";
import Toast from "../components/Toast";

const NewNumOrder = ({
  isModalNewNumOrder,
  setIsModalNewNumOrder,
  employee,
}: any) => {
  const {
    state: {
      employees,
      loading,
      showSuccessToast,
      showErrorToast,
      showSuccessToastMsg,
    },
    dispatch: dispatchEmployee,
  } = useEmployee();

  const {
    state: { user },
  } = useUser();

  const [newNumOrder, setNewNumOrder] = useState(0);
  const [isModalKeyboardNumOpen, setIsModalKeyboardNumOpen] = useState(false);

  const closeModal = () => {
    setNewNumOrder(0);
    setIsModalNewNumOrder(false);
  };

  const handleNewNumOrder = () => {
    const foundEmployee = employees.find((emp) => emp.name === employee);

    dispatchEmployee(
      employeeActions.addNewNumOrder({
        employeeId: foundEmployee.id,
        newNumOrder,
      })(dispatchEmployee)
    );
  };

  const handleManualNumOrder = (item: any) => {
    if (item.action === "deleteLast") {
      return setNewNumOrder((currentValue: any) =>
        Number(String(currentValue).slice(0, -1))
      );
    }

    if (item.action === "addPrice") {
      return setIsModalKeyboardNumOpen(false);
    }

    setNewNumOrder((currentValue: any) =>
      Number(String(currentValue) + String(item.value))
    );
  };

  return (
    <>
      {isModalNewNumOrder && (
        <div className="fixed inset-0 bg-[#252525] bg-opacity-60 flex items-center justify-center">
          {/* Contenido del modal */}
          <div className="w-[50vh] bg-gray-800 border border-[#000000] p-8 rounded shadow-md relative">
            {/* Icono de cerrar en la esquina superior derecha */}
            <button
              className="absolute top-4 right-4 text-white"
              onClick={closeModal}
            >
              <MdClose className="text-2xl" />
            </button>

            <h2 className="text-white text-lg font-bold mb-4">
              N° Orden - {employee}
            </h2>

            <div className="mb-4 h-[5vh] flex items-center justify-start">
              <label className="mr-2 text-white">Establezca N° Orden:</label>

              <input
                type="text"
                className="w-[10vh] p-2 border border-[#484E55] rounded-md mr-2"
                readOnly
                value={newNumOrder}
                onFocus={() => {
                  setIsModalKeyboardNumOpen(true);
                }}
              />
            </div>

            <br />

            <div className="flex space-x-4">
              <div
                className="w-1/2 bg-blue-800 hover:bg-blue-800 hover:cursor-pointer text-white px-4 py-2 rounded-md flex items-center justify-center mx-auto select-none"
                onClick={closeModal}
              >
                Cancelar
              </div>
              <div
                className={`${
                  newNumOrder > 0 && newNumOrder <= 100
                    ? "bg-green-800 hover:bg-green-800 hover:cursor-pointer"
                    : "bg-gray-500"
                } w-1/2 text-white px-4 py-2 rounded-md flex items-center justify-center mx-auto select-none `}
                onClick={() =>
                  newNumOrder > 0 && newNumOrder <= 100 && handleNewNumOrder()
                }
              >
                Establecer nuevo N°
                {loading && (
                  <div className="ml-2">
                    <Spinner />
                  </div>
                )}
              </div>
            </div>
          </div>
          <KeyboardNum
            isModalKeyboardNumOpen={isModalKeyboardNumOpen}
            manualNum={newNumOrder}
            handleManualNum={handleManualNumOrder}
            closeModal={() => setIsModalKeyboardNumOpen(false)}
            title={`Ingrese nuevo N°`}
          />

          {showSuccessToast && (
            <Toast
              type="success"
              message={showSuccessToastMsg}
              onClose={() =>
                dispatchEmployee(
                  employeeActions.setHideToasts()(dispatchEmployee)
                )
              }
            />
          )}

          {showErrorToast && (
            <Toast
              type="error"
              message={showSuccessToastMsg}
              onClose={() =>
                dispatchEmployee(
                  employeeActions.setHideToasts()(dispatchEmployee)
                )
              }
            />
          )}
        </div>
      )}
    </>
  );
};

export default NewNumOrder;
