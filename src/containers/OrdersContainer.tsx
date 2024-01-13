import { useState } from "react";
import { useEmployee } from "../contexts/EmployeeContext";
import { saleActions, useSale } from "../contexts/SaleContext";
import Table from "../components/Table";
import { formatCurrency } from "../utils/formatUtils";
import Spinner from "../components/Spinner";

const OrdersContainer = () => {
  const {
    state: { employees },
  } = useEmployee();
  const {
    state: { sales, loading },
    dispatch: dispatchSale,
  } = useSale();
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    store: "",
    employee: "",
  });

  const columns = [
    { title: "Fecha", dataIndex: "date" },
    { title: "Vendedor", dataIndex: "employee" },
    { title: "Orden", dataIndex: "order" },
    { title: "Sucursal", dataIndex: "store" },
    { title: "Tipo venta", dataIndex: "typeSale" },
    { title: "Tipo pago", dataIndex: "typePayment" },
    { title: "Items", dataIndex: "items" },
    {
      title: "Sub. Items",
      dataIndex: "subTotalItems",
      format: (number: any) => `$${formatCurrency(number)}`,
      sumAcc: true,
    },
    { title: "Devol", dataIndex: "devolutionItems" },
    {
      title: "Sub. Devol",
      dataIndex: "subTotalDevolutionItems",
      format: (number: any) => `$${formatCurrency(number)}`,
      sumAcc: true,
    },
    { title: "%", dataIndex: "percentageToDisccountOrAdd" },
    {
      title: "Total",
      dataIndex: "total",
      format: (number: any) => `$${formatCurrency(number)}`,
      sumAcc: true,
    },
  ];

  return (
    <>
      <div className="h-[8vh] relative p-2 border border-[#484E55] flex justify-center">
        <div className="inline-block">
          <label className="mr-2 text-white">Desde:</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={({ target }: any) =>
              setFilters((props) => ({ ...props, startDate: target.value }))
            }
            className="p-2 border border-gray-300 rounded-md"
          />
          <label className="ml-2 mr-2 text-white">Hasta:</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={({ target }: any) =>
              setFilters((props) => ({ ...props, endDate: target.value }))
            }
            className="p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="ml-4 inline-block">
          <label className="mr-2 text-white">Filtrar por sucursal:</label>
          <select
            className="p-2 border border-[#484E55] rounded-md"
            onChange={({ target }: any) =>
              setFilters((props) => ({ ...props, store: target.value }))
            }
            defaultValue=""
          >
            <option value="" className="py-2">
              Todos
            </option>
            <option value="BOGOTA" className="py-2">
              Bogota
            </option>
            <option value="HELGUERA" className="py-2">
              Helguera
            </option>
          </select>
        </div>
        <div className="ml-4 inline-block">
          <label className="mr-2 text-white">por empleado:</label>
          <select
            className="p-2 border border-[#484E55] rounded-md"
            onChange={({ target }: any) =>
              setFilters((props) => ({ ...props, employee: target.value }))
            }
            defaultValue=""
          >
            <option value="" className="py-2">
              Todos
            </option>
            {employees.map((employee: any) => (
              <option value={employee.name} key={employee.id} className="py-2">
                {employee.name}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-10 inline-block">
          <div
            className={`inline-block px-4 py-2 rounded-md border text-white select-none ${
              Boolean(filters.startDate.length) &&
              Boolean(filters.endDate.length) &&
              "bg-[#1b78e2] border-[#1b78e2] hover:cursor-pointer hover:opacity-80 transition-opacity"
            } flex items-center mx-auto`}
            onClick={() =>
              !loading &&
              dispatchSale(saleActions.getSales(filters)(dispatchSale))
            }
          >
            Buscar
            {loading && (
              <div className="ml-2">
                <Spinner />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 h-[70vh] mx-auto max-w overflow-hidden overflow-y-auto">
        <Table data={sales} columns={columns} />
      </div>
    </>
  );
};

export default OrdersContainer;
