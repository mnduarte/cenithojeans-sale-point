import { MdClose } from "react-icons/md";
import EditableTable from "../components/EditableTable";
import Spinner from "../components/Spinner";

const ObservationsByMonth = ({
  isModalObservationsByMonth,
  setIsModalObservationsByMonth,
  month,
  loading,
  observations,
}: any) => {
  const columns = [
    { title: "Fecha", dataIndex: "date" },
    { title: "Observacion", dataIndex: "observation" },
  ];

  const closeModal = () => {
    setIsModalObservationsByMonth(false);
  };

  return (
    <>
      {isModalObservationsByMonth && (
        <div className="fixed inset-0 bg-[#252525] bg-opacity-60 flex items-center justify-center">
          <div className="w-[50vh] bg-gray-800 border border-[#000000] p-8 rounded shadow-md relative">
            <button
              className="absolute top-4 right-4 text-white"
              onClick={closeModal}
            >
              <MdClose className="text-2xl" />
            </button>

            <h2 className="text-white text-lg font-bold mb-4">
              Observaciones de {month}
            </h2>

            <div className="mt-5 max-w h-[30vh] overflow-hidden overflow-y-auto overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center h-[70vh]">
                  <Spinner size="lg" />
                </div>
              ) : (
                <EditableTable
                  data={observations}
                  columns={columns}
                  table={`-`}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ObservationsByMonth;
