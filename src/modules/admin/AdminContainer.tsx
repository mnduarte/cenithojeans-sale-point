import { DatePicker } from "antd";
import { formatDateToYYYYMMDD } from "../../utils/formatUtils";
import { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import dayjs from "dayjs";
import { dateFormat } from "../../utils/constants";

import Spinner from "../../components/Spinner";
import { adminActions, useAdmin } from "../../contexts/AdminContext";
import { MdClose } from "react-icons/md";
import Toast from "../../components/Toast";

const ModalDeleteConfirm = ({
  isModalDeleteConfirm,
  setIsModalDeleteConfirm,
  filters,
  withFilters,
}: any) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();

  const {
    state: { loading },
    dispatch,
  } = useAdmin();

  return (
    <>
      {isModalDeleteConfirm && (
        <div className="fixed inset-0 bg-[#252525] bg-opacity-60 flex items-center justify-center">
          {/* Contenido del modal */}
          <div
            className={`w-[60vh] h-[25vh] p-8 rounded-md shadow-md relative ${themeStyles[theme].tailwindcss.modal}`}
          >
            {/* Icono de cerrar en la esquina superior derecha */}
            <button
              className="absolute top-4 right-4"
              onClick={() => setIsModalDeleteConfirm(false)}
            >
              <MdClose className="text-2xl" />
            </button>

            <h2 className="text-lg font-bold mb-4">
              Confirmar eliminacion de registros
            </h2>
            <div className="mb-2">
              ¿Esta seguro de eliminar
              {!withFilters && <span className="font-bold"> TODOS</span>} los
              registros
              {withFilters &&
                ` desde ${dayjs(filters.startDate).format(
                  "DD-MM-YYYY"
                )} hasta ${dayjs(filters.endDate).format("DD-MM-YYYY")}`}
              ?
              <br />
              La eliminacion es permanente sin posibilidad de recupero
            </div>
            <br />

            <div className="flex space-x-4">
              <div
                className="w-1/2 bg-blue-800 hover:bg-blue-800 hover:cursor-pointer text-white px-4 py-2 rounded-md flex items-center justify-center mx-auto select-none"
                onClick={() => setIsModalDeleteConfirm(false)}
              >
                Cancelar
              </div>
              <div
                className={` bg-red-800  w-1/2 text-white px-4 py-2 rounded-md flex items-center justify-center mx-auto select-none `}
                onClick={() =>
                  !loading &&
                  dispatch(
                    adminActions.deleteData(withFilters ? filters : {})(
                      dispatch
                    )
                  )
                }
              >
                ELIMINAR
                {loading && (
                  <div className="ml-2">
                    <Spinner />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const AdminContainer = () => {
  const {
    state: { theme, themeStyles },
  } = useTheme();

  const {
    state: { loading, showSuccessToast, showErrorToast, showSuccessToastMsg },
    dispatch,
  } = useAdmin();

  const [isModalDeleteConfirm, setIsModalDeleteConfirm] = useState(false);
  const [withFilters, setIsWithFilters] = useState(false);

  const [filters, setFilters] = useState({
    startDate: formatDateToYYYYMMDD(new Date()),
    endDate: formatDateToYYYYMMDD(new Date()),
  });

  return (
    <>
      <div className="p-4 rounded-md">
        <h3 className="text-2xl mb-4 ">
          <label>Borrar registros (Ventas/Ingresos/Egresos/Comentarios)</label>
        </h3>

        <div
          className={`h-12 relative p-2 border ${themeStyles[theme].tailwindcss.border} flex justify-center`}
        >
          <div className=" inline-block">
            <label className="mr-1">Desde:</label>
            <DatePicker
              onChange={(date: any) =>
                setFilters((props) => ({
                  ...props,
                  startDate: date.format("YYYY-MM-DD"),
                }))
              }
              className={themeStyles[theme].datePickerIndicator}
              style={themeStyles[theme].datePicker}
              popupClassName={themeStyles[theme].classNameDatePicker}
              allowClear={false}
              format={dateFormat}
              value={dayjs(filters.startDate)}
            />
            <label className="ml-1 mr-1">Hasta:</label>

            <DatePicker
              onChange={(date: any) =>
                setFilters((props) => ({
                  ...props,
                  endDate: date.format("YYYY-MM-DD"),
                }))
              }
              className={themeStyles[theme].datePickerIndicator}
              style={themeStyles[theme].datePicker}
              popupClassName={themeStyles[theme].classNameDatePicker}
              allowClear={false}
              format={dateFormat}
              value={dayjs(filters.endDate)}
            />
          </div>

          <div
            className={`ml-5 px-4 rounded-md border border-red-600 text-white bg-red-600 flex items-center`}
            onClick={() => {
              if (!loading) {
                setIsWithFilters(true);
                setIsModalDeleteConfirm(true);
              }
            }}
          >
            Eliminar por fecha seleccionada
            {loading && (
              <div className="ml-2">
                <Spinner />
              </div>
            )}
          </div>

          <div
            className={`px-4 py-1 rounded-md border text-white select-none border-red-800 text-white bg-red-800 flex items-center mx-auto`}
            onClick={() => {
              if (!loading) {
                setIsWithFilters(false);
                setIsModalDeleteConfirm(true);
              }
            }}
          >
            Eliminar Todos los registros
            {loading && (
              <div className="ml-2">
                <Spinner />
              </div>
            )}
          </div>
        </div>

        <ModalDeleteConfirm
          isModalDeleteConfirm={isModalDeleteConfirm}
          setIsModalDeleteConfirm={setIsModalDeleteConfirm}
          filters={filters}
          withFilters={withFilters}
        />

        {showSuccessToast && (
          <Toast
            type="success"
            message={showSuccessToastMsg}
            onClose={() => dispatch(adminActions.setHideToasts()(dispatch))}
          />
        )}

        {showErrorToast && (
          <Toast
            type="error"
            message={showSuccessToastMsg}
            onClose={() => dispatch(adminActions.setHideToasts()(dispatch))}
          />
        )}
      </div>
    </>
  );
};

export default AdminContainer;
