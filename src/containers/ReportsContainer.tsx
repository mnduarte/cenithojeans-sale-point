import { useState } from "react";
import { saleActions, useSale } from "../contexts/SaleContext";
import { formatCurrency } from "../utils/formatUtils";
import { mappingListStore, months } from "../utils/constants";
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
import { MdClose } from "react-icons/md";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PdfReportByWeek from "../components/PdfReportByWeek";

const ModalDetailByEmployee = ({
  isModalListOutgoingOpen,
  setIsModalDetailByEmployeeOpen,
  week,
  report,
  reports = [],
}: any) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();
  const columnsLocalSalesByEmployee = [
    { title: "Prendas", dataIndex: "items", sumAcc: true },
    {
      title: "Venta",
      dataIndex: "cash",
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

  const columns =
    reports.typeSale === "local"
      ? columnsLocalSalesByEmployee
      : columnsLocalPedidosByEmployee;

  return (
    <>
      {isModalListOutgoingOpen && (
        <div className="fixed inset-0 bg-[#252525] bg-opacity-60 flex items-center justify-center">
          {/* Contenido del modal */}
          <div
            className={`max-w h-[45vh] overflow-hidden overflow-y-auto overflow-x-auto p-8 rounded-md shadow-md relative ${themeStyles[theme].tailwindcss.modal}`}
          >
            {/* Icono de cerrar en la esquina superior derecha */}
            <button
              className="absolute top-4 right-4"
              onClick={() => setIsModalDetailByEmployeeOpen(false)}
            >
              <MdClose className="text-2xl" />
            </button>

            <h2 className="text-lg font-bold mb-4">
              Detalle de la semana - {week}
            </h2>
            <div className="mt-5 h-[32vh] max-w overflow-hidden overflow-y-auto overflow-x-auto flex flex-no-wrap">
              {report.salesByEmployees &&
                report.salesByEmployees.map(
                  (saleByEmployee: any, idx: number) => (
                    <div
                      className={`mt-5 mr-4 text-xs`}
                      key={idx + "byEmployee"}
                    >
                      <div className="mb-2 flex items-center justify-center">
                        <label className="text-2xl text-base font-bold">
                          {saleByEmployee.employee}
                        </label>
                      </div>
                      <EditableTable
                        data={saleByEmployee.sales}
                        columns={
                          idx === 0
                            ? [
                                { title: "Fecha", dataIndex: "date" },
                                ...columns,
                              ]
                            : columns
                        }
                        table={`-byEmployee`}
                      />
                    </div>
                  )
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ReportsContainer = () => {
  const {
    state: { theme, themeStyles },
  } = useTheme();
  const [isModalOutgoingsByDayList, setIsModalOutgoingsByDayList] =
    useState(false);
  const [isModalObservationsByMonth, setIsModalObservationsByMonth] =
    useState(false);
  const [isModalListOutgoingOpen, setIsModalDetailByEmployeeOpen] =
    useState(false);

  const [detailByWeek, setDetailByWeek] = useState({
    week: 0,
    report: {},
    reports: {},
  });
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
      dataIndex: "cash",
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
      <div
        className={`h-15 relative p-1 border ${themeStyles[theme].tailwindcss.border} flex justify-center`}
      >
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
            options={months.map((month:any, index: any) => ({
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
                <div className="flex mb-5" key={idx + "byDay"}>
                  <div className="w-[50vh] mr-10" key={idx + "byDay"}>
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

                  <div
                    className={`h-8 ml-2 cursor-pointer inline-block px-4 py-1 rounded-md bg-blue-600 text-white`}
                    onClick={() => {
                      setDetailByWeek({
                        week: report.week,
                        report: report,
                        reports: reports,
                      });
                      setIsModalDetailByEmployeeOpen(true);
                    }}
                  >
                    Ver detalle por empleado
                  </div>

                  <PDFDownloadLink
                    document={
                      <PdfReportByWeek
                        week={report.week}
                        store={mappingListStore[filters.store]}
                        type={reports.typeSale}
                        dataWeek={report.salesGeneral}
                        salesByEmployees={report.salesByEmployees}
                      />
                    }
                    fileName={`informe-${reports.typeSale}-semana-${report.week}.pdf`}
                    className="w-25 h-8 ml-2 bg-cyan-700 hover:bg-green-800 hover:cursor-pointer text-white px-4 py-1 rounded-md flex items-center justify-center select-none"
                  >
                    {({ loading, url, error, blob }) =>
                      loading ? (
                        <button>Cargando Documento ...</button>
                      ) : (
                        <button>Generar PDF</button>
                      )
                    }
                  </PDFDownloadLink>
                </div>
              );
            })}
        </div>
        <ModalDetailByEmployee
          isModalListOutgoingOpen={isModalListOutgoingOpen}
          setIsModalDetailByEmployeeOpen={setIsModalDetailByEmployeeOpen}
          week={detailByWeek.week}
          report={detailByWeek.report}
          reports={detailByWeek.reports}
        />
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
