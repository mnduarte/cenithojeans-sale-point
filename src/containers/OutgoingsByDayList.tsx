import { MdClose } from "react-icons/md";
import EditableTable from "../components/EditableTable";
import Spinner from "../components/Spinner";
import { formatCurrency } from "../utils/formatUtils";

const OutgoingsByDayList = ({
  isModalOutgoingsByDayList,
  setIsModalOutgoingsByDayList,
  loading,
  outgoings,
  date,
}: any) => {
  const columns = [
    {
      title: "Importe",
      dataIndex: "amount",
      format: (number: any) => `$${formatCurrency(number)}`,
    },
    { title: "Descripcion", dataIndex: "description" },
  ];

  const closeModal = () => {
    setIsModalOutgoingsByDayList(false);
  };

  return (
    <>
      {isModalOutgoingsByDayList && (
        <div className="fixed inset-0 bg-[#252525] bg-opacity-60 flex items-center justify-center">
          <div className="w-[50vh] bg-gray-800 border border-[#000000] p-8 rounded shadow-md relative">
            <button
              className="absolute top-4 right-4 text-white"
              onClick={closeModal}
            >
              <MdClose className="text-2xl" />
            </button>

            <h2 className="text-white text-lg font-bold mb-4">
              Detalle de Gastos - {date}
            </h2>

            <div className="flex items-center justify-start">
              {loading ? (
                <div className="flex items-center justify-center h-[70vh]">
                  <Spinner size="lg" />
                </div>
              ) : (
                <EditableTable data={outgoings} columns={columns} table={`-`} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OutgoingsByDayList;
