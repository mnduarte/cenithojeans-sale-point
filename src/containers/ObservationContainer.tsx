import { useState } from "react";
import { MdClose } from "react-icons/md";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";
import Keyboard from "../components/Keyboard";
import { useUser } from "../contexts/UserContext";
import {
  observationActions,
  useObservation,
} from "../contexts/ObservationContext";
import { useTheme } from "../contexts/ThemeContext";

const ObservationContainer = ({
  isModalObservationOpen,
  setIsModalObservationOpen,
}: any) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();
  const {
    state: { user },
  } = useUser();
  const {
    state: {
      loading: loadingObservation,
      showSuccessToast,
      showSuccessToastMsg,
      showErrorToast,
    },
    dispatch: dispatchObservation,
  } = useObservation();

  const [observation, setObservation] = useState("");

  const closeModal = () => {
    setObservation("");
    setIsModalObservationOpen(false);
  };

  const handleObservation = () => {
    const data = {
      observation,
      store: user.store === "ALL" ? "BOGOTA" : user.store,
      username: user.username,
    };

    dispatchObservation(
      observationActions.addObservation(data)(dispatchObservation)
    );
    setObservation("");
  };

  return (
    <>
      {isModalObservationOpen && (
        <div className="fixed inset-0 bg-[#252525] bg-opacity-60 flex items-center justify-center">
          {/* Contenido del modal */}
          <div className={`w-[60vh] p-8 rounded-md shadow-md relative  ${themeStyles[theme].tailwindcss.modal}`}>
            {/* Icono de cerrar en la esquina superior derecha */}
            <button
              className="absolute top-4 right-4"
              onClick={closeModal}
            >
              <MdClose className="text-2xl" />
            </button>

            <h2 className=" text-lg font-bold mb-4">Agregar Observacion</h2>

            <div className="mb-4">
              <textarea
                value={observation}
                readOnly
                className={`w-[50vh] p-2 rounded-md mr-2 text-lg ${themeStyles[theme].tailwindcss.inputText}`}
              />
            </div>

            <Keyboard
              onKeyPress={(e: any) => {
                let newDescription = observation;

                if (e.action === "deleteLast") {
                  newDescription = newDescription.slice(0, -1);
                }

                if (e.action === "addSpace") {
                  newDescription = newDescription + " ";
                }

                if (!e.action) {
                  newDescription = newDescription + e.value.toLowerCase();
                }

                setObservation(newDescription);
              }}
            />

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
                  !Boolean(observation.length)
                    ? "bg-gray-500"
                    : "bg-green-800 hover:bg-green-800 hover:cursor-pointer"
                } w-1/2 text-white px-4 py-2 rounded-md flex items-center justify-center mx-auto select-none`}
                onClick={() =>
                  Boolean(observation.length) && handleObservation()
                }
              >
                Guardar
                {loadingObservation && (
                  <div className="ml-2">
                    <Spinner />
                  </div>
                )}
              </div>
            </div>
          </div>
          {showSuccessToast && (
            <Toast
              type="success"
              message={showSuccessToastMsg}
              onClose={() =>
                dispatchObservation(
                  observationActions.setHideToasts()(dispatchObservation)
                )
              }
            />
          )}

          {showErrorToast && (
            <Toast
              type="error"
              message={showSuccessToastMsg}
              onClose={() =>
                dispatchObservation(
                  observationActions.setHideToasts()(dispatchObservation)
                )
              }
            />
          )}
        </div>
      )}
    </>
  );
};

export default ObservationContainer;
