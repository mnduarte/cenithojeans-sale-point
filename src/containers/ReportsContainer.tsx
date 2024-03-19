import { useState } from "react";
import { saleActions, useSale } from "../contexts/SaleContext";
import { formatCurrency } from "../utils/formatUtils";
import { months } from "../utils/constants";
import Spinner from "../components/Spinner";
import EditableTable from "../components/EditableTable";
import { cashflowActions, useCashflow } from "../contexts/CashflowContext";
import OutgoingsByDayList from "./OutgoingsByDayList";
import {
  observationActions,
  useObservation,
} from "../contexts/ObservationContext";
import ObservationsByMonth from "./ObservationsByMonth";
import { FaEye } from "react-icons/fa";
import { Select } from "antd";
import { useTheme } from "../contexts/ThemeContext";

const ReportsContainer = () => {
  const {
    state: { theme, themeStyles },
  } = useTheme();
  const [isModalOutgoingsByDayList, setIsModalOutgoingsByDayList] =
    useState(false);
  const [isModalObservationsByMonth, setIsModalObservationsByMonth] =
    useState(false);
  const [dateSelected, setDateSelected] = useState("");
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const {
    state: { reports, loading },
    dispatch: dispatchSale,
  } = useSale();
  const {
    state: { outgoingsByDay, loading: loadingCashflow },
    dispatch: dispatchCashflow,
  } = useCashflow();
  const {
    state: { observations, loading: loadingObservation },
    dispatch: dispatchObservation,
  } = useObservation();
  const [filters, setFilters] = useState({
    month: Number(currentMonth),
    year: currentYear,
    store: "BOGOTA",
    typeSale: "local",
  });

  const columnsLocalSalesByDay = [
    { title: "Fecha", dataIndex: "date" },
    { title: "Prendas", dataIndex: "items", sumAcc: true },
    {
      title: "Gastos",
      dataIndex: "outgoings",
      format: (number: any) => `$${formatCurrency(number)}`,
      sumAcc: true,
      applyFormat: true,
    },
    {
      title: "Venta",
      dataIndex: "total",
      format: (number: any) => `$${formatCurrency(number)}`,
      sumAcc: true,
      applyFormat: true,
    },
    {
      title: "TotalCaja",
      dataIndex: "totalBox",
      format: (number: any) => `$${formatCurrency(number)}`,
      sumAcc: true,
      applyFormat: true,
    },
  ];

  const columnsPedidoSalesByDay = [
    { title: "Fecha", dataIndex: "date" },
    { title: "Prendas", dataIndex: "items", sumAcc: true },
    {
      title: "Efectivo",
      dataIndex: "cash",
      format: (number: any) => `$${formatCurrency(number)}`,
      sumAcc: true,
      applyFormat: true,
    },
    {
      title: "Transferencia",
      dataIndex: "transfer",
      format: (number: any) => `$${formatCurrency(number)}`,
      sumAcc: true,
      applyFormat: true,
    },
    {
      title: "Total",
      dataIndex: "total",
      format: (number: any) => `$${formatCurrency(number)}`,
      sumAcc: true,
      applyFormat: true,
    },
  ];

  const columnsLocalSalesByEmployee = [
    { title: "Prendas", dataIndex: "items", sumAcc: true },
    {
      title: "Venta",
      dataIndex: "total",
      format: (number: any) => `$${formatCurrency(number)}`,
      sumAcc: true,
      applyFormat: true,
    },
  ];

  const columnsLocalPedidosByEmployee = [
    { title: "Prendas", dataIndex: "items", sumAcc: true },
    {
      title: "Efectivo",
      dataIndex: "cash",
      format: (number: any) => `$${formatCurrency(number)}`,
      sumAcc: true,
      applyFormat: true,
    },
    {
      title: "Transferencia",
      dataIndex: "transfer",
      format: (number: any) => `$${formatCurrency(number)}`,
      sumAcc: true,
      applyFormat: true,
    },
    {
      title: "Venta",
      dataIndex: "total",
      format: (number: any) => `$${formatCurrency(number)}`,
      sumAcc: true,
      applyFormat: true,
    },
  ];

  const handleOutGoings = ({ date, outgoings }: any) => {
    const [day, month, year] = date.split("/");
    const outputDate = `${year}-${month}-${day}`;

    if (outgoings) {
      dispatchCashflow(
        cashflowActions.getOutgoingsByDay({
          date: outputDate,
          store: filters.store,
        })(dispatchCashflow)
      );
      setDateSelected(date);
      setIsModalOutgoingsByDayList(true);
    }
  };

  return (
    <>
      <div className={`h-15 relative p-1 border ${themeStyles[theme].tailwindcss.border} flex justify-center`}>
        <div className="inline-block">
          <label className="mr-2">Mes y Año:</label>

          <Select
            value={months[filters.month]}
            className={themeStyles[theme].classNameSelector}
            dropdownStyle={{
              ...themeStyles[theme].dropdownStylesCustom,
              width: 110,
            }}
            popupClassName={themeStyles[theme].classNameSelectorItem}
            style={{ width: 110 }}
            onSelect={(value: any) =>
              setFilters((props) => ({
                ...props,
                month: Number(value),
              }))
            }
            options={months.map((month, index: any) => ({
              value: index,
              label: month,
            }))}
          />

          <Select
            value={filters.year}
            className={themeStyles[theme].classNameSelector}
            dropdownStyle={{
              ...themeStyles[theme].dropdownStylesCustom,
              width: 80,
            }}
            popupClassName={themeStyles[theme].classNameSelectorItem}
            style={{ width: 80, marginLeft: 5 }}
            onSelect={(value: any) =>
              setFilters((props) => ({
                ...props,
                year: Number(value),
              }))
            }
            options={Array.from({ length: 8 }, (_, i) => ({
              value: currentYear + i,
              label: currentYear + i,
            }))}
          />
        </div>
        <div className="ml-4 inline-block">
          <label className="mr-2">por sucursal:</label>

          <Select
            defaultValue="BOGOTA"
            className={themeStyles[theme].classNameSelector}
            dropdownStyle={themeStyles[theme].dropdownStylesCustom}
            popupClassName={themeStyles[theme].classNameSelectorItem}
            style={{ width: 110 }}
            onSelect={(value: any) =>
              setFilters((props) => ({ ...props, store: value }))
            }
            options={[
              { label: "Bogota", value: "BOGOTA" },
              { label: "Helguera", value: "HELGUERA" },
            ]}
          />
        </div>

        <div className="ml-4 inline-block">
          <label className="mr-2">por tipo de pago:</label>
          <Select
            defaultValue="local"
            className={themeStyles[theme].classNameSelector}
            dropdownStyle={themeStyles[theme].dropdownStylesCustom}
            popupClassName={themeStyles[theme].classNameSelectorItem}
            style={{ width: 110 }}
            onSelect={(value: any) =>
              setFilters((props) => ({ ...props, typeSale: value }))
            }
            options={[
              { value: "local", label: "Local" },
              { value: "pedido", label: "Pedido" },
            ]}
          />
        </div>

        <div className="ml-10 inline-block">
          <div
            className={`inline-block px-4 py-1 rounded-md border text-white select-none bg-[#1b78e2] border-[#1b78e2] hover:cursor-pointer hover:opacity-80 transition-opacity flex items-center mx-auto`}
            onClick={() =>
              !loading &&
              dispatchSale(saleActions.getReports(filters)(dispatchSale))
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

        <div className="ml-10 inline-block">
          <div
            className={`inline-block px-4 py-2 rounded-md border text-white select-none bg-green-800 border-green-800 hover:cursor-pointer hover:opacity-80 transition-opacity flex items-center mx-auto`}
            onClick={() => {
              dispatchObservation(
                observationActions.getObservations(filters)(dispatchObservation)
              );
              setIsModalObservationsByMonth(true);
            }}
          >
            <FaEye />
          </div>
        </div>
      </div>

      <div className="mt-5 max-w h-[80vh] overflow-hidden overflow-y-auto overflow-x-auto">
        <div>
          {Boolean(reports.salesGeneral.length) &&
            reports.salesGeneral.map((report: any, idx: number) => {
              return (
                <div className="flex mb-5">
                  <div className="w-50 mr-10" key={idx + "byDay"}>
                    <div className="mb-2 flex ">
                      <label className="text-2xl text-base font-bold">
                        SEMANA {report.week}
                      </label>
                    </div>
                    <EditableTable
                      data={report.salesGeneral}
                      columns={
                        reports.typeSale === "local"
                          ? columnsLocalSalesByDay
                          : columnsPedidoSalesByDay
                      }
                      handleEditClick={handleOutGoings}
                      setItemInOnClick={true}
                      table={`-byDay`}
                    />
                  </div>
                  {report.salesByEmployees.map(
                    (saleByEmployee: any, idx: number) => (
                      <div
                        className={`${
                          reports.typeSale === "local" ? "max-w" : "max-w"
                        } border-r border-green-900 mr-2`}
                        key={idx + "byEmployee"}
                      >
                        <div className="mb-2 flex items-center justify-center">
                          <label className="text-2xl text-white text-base font-bold">
                            {saleByEmployee.employee}
                          </label>
                        </div>
                        <EditableTable
                          data={saleByEmployee.sales}
                          columns={
                            reports.typeSale === "local"
                              ? columnsLocalSalesByEmployee
                              : columnsLocalPedidosByEmployee
                          }
                          table={`-byEmployee`}
                        />
                      </div>
                    )
                  )}
                </div>
              );
            })}
        </div>
        <OutgoingsByDayList
          isModalOutgoingsByDayList={isModalOutgoingsByDayList}
          setIsModalOutgoingsByDayList={setIsModalOutgoingsByDayList}
          loading={loadingCashflow}
          outgoings={outgoingsByDay}
          date={dateSelected}
        />
        <ObservationsByMonth
          isModalObservationsByMonth={isModalObservationsByMonth}
          setIsModalObservationsByMonth={setIsModalObservationsByMonth}
          loading={loadingObservation}
          observations={observations}
          month={months.find((m: any, idx: number) => idx === filters.month)}
        />
      </div>
    </>
  );
};

export default ReportsContainer;
