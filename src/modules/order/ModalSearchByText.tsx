import { useState } from "react";
import { MdClose } from "react-icons/md";
import Keyboard from "../../components/Keyboard";
import { useTheme } from "../../contexts/ThemeContext";

const ModalSearchByText = ({
  isModalSearchByTextOpen,
  setIsModalSearchByTextOpen,
  handleSearchByText,
}: any) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();

  const [q, setQ] = useState("");

  return (
    <>
      {isModalSearchByTextOpen && (
        <div className="fixed inset-0 bg-[#252525] bg-opacity-60 flex items-center justify-center">
          {/* Contenido del modal */}
          <div
            className={`w-[60vh] p-8 rounded-md shadow-md relative  ${themeStyles[theme].tailwindcss.modal}`}
          >
            {/* Icono de cerrar en la esquina superior derecha */}
            <button
              className="absolute top-4 right-4"
              onClick={() => {
                setQ("");
                setIsModalSearchByTextOpen(false);
              }}
            >
              <MdClose className="text-2xl" />
            </button>

            <h2 className=" text-lg font-bold mb-4">
              Ingresa el texto a buscar:
            </h2>

            <div className="mb-4">
              <textarea
                value={q}
                readOnly
                className={`w-[50vh] p-2 rounded-md mr-2 text-lg ${themeStyles[theme].tailwindcss.inputText}`}
              />
            </div>

            <Keyboard
              onKeyPress={(e: any) => {
                let newDescription = q;

                if (e.action === "deleteLast") {
                  newDescription = newDescription.slice(0, -1);
                }

                if (e.action === "addSpace") {
                  newDescription = newDescription + " ";
                }

                if (!e.action) {
                  newDescription = newDescription + e.value.toLowerCase();
                }

                setQ(newDescription);
              }}
            />

            <br />

            <div className="flex space-x-4">
              <div
                className="w-1/2 bg-blue-800 hover:bg-blue-800 hover:cursor-pointer text-white px-4 py-2 rounded-md flex items-center justify-center mx-auto select-none"
                onClick={() => {
                  setQ("");
                  setIsModalSearchByTextOpen(false);
                }}
              >
                Cancelar
              </div>
              <div
                className={`${
                  !Boolean(q.length)
                    ? "bg-gray-500"
                    : "bg-green-800 hover:bg-green-800 hover:cursor-pointer"
                } w-1/2 text-white px-4 py-2 rounded-md flex items-center justify-center mx-auto select-none`}
                onClick={() => {
                  handleSearchByText(q);
                  setQ("");
                }}
              >
                Agregar
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalSearchByText;
