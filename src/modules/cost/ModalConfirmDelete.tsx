import { MdClose } from "react-icons/md";
import { useTheme } from "../../contexts/ThemeContext";
import { useState } from "react";
import { costActions, useCost } from "../../contexts/CostContext";
import CrudTable from "../../components/CrudTable";

export const ModalConfirmDelete = ({
  isModalOpen,
  setIsModaOpen,
  handleAction,
}: any) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();

  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#252525] bg-opacity-60 flex items-center justify-center">
          <div
            className={`px-8 py-6 rounded-md shadow-md relative ${themeStyles[theme].tailwindcss.modal}`}
          >
            {/* Icono de cerrar en la esquina superior derecha */}
            <button
              className="absolute top-4 right-4"
              onClick={() => setIsModaOpen(false)}
            >
              <MdClose className="text-2xl" />
            </button>

            <h2 className="text-lg font-bold mb-4">Confirmar Accion</h2>
            <h2 className=" mb-4">
              Esta seguro que quiere eliminar los items seleccionados?
            </h2>

            <div className="mt-2 h-[4vh] mx-auto max-w flex items-center">
              <div
                className=" bg-gray-700 hover:bg-gray-800 hover:cursor-pointer text-white px-2  py-1 rounded-md flex items-center justify-center select-none"
                onClick={() => setIsModaOpen(false)}
              >
                Cancelar
              </div>
              <div
                className=" ml-2 bg-red-700 hover:bg-red-800 hover:cursor-pointer text-white px-2  py-1 rounded-md flex items-center justify-center select-none"
                onClick={handleAction}
              >
                Eliminar
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
