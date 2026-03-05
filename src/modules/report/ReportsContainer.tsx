import { useState } from "react";
import { saleActions, useSale } from "../../contexts/SaleContext";
import {
  formatCurrency,
  formatDateToYYYYMMDD,
  formatDate,
} from "../../utils/formatUtils";
import { dateFormat, mappingListStore, months } from "../../utils/constants";
import Spinner from "../../components/Spinner";
import EditableTable from "../../components/EditableTable";
import { cashflowActions, useCashflow } from "../../contexts/CashflowContext";
import OutgoingsByDayList from "./OutgoingsByDayList";
import {
  observationActions,
  useObservation,
} from "../../contexts/ObservationContext";
import ObservationsByMonth from "./ObservationsByMonth";
import { FaEye } from "react-icons/fa";
import { DatePicker, Select } from "antd";
import { useTheme } from "../../contexts/ThemeContext";
import { MdClose } from "react-icons/md";
import PdfReportByWeek from "./PdfReportByWeek";
import PdfReportByEmployee from "./PdfReportByEmployee";
import ModalGenerar from "../../components/ModalGenerar";
import {
  createWorkbook,
  downloadWorkbook,
  getExcelFileName,
  xlColWidths,
  xlHeader,
  xlTotal,
  xlVendor,
  xlData,
  xlSectionTitle,
} from "../../utils/excelUtils";
import { HiDocumentReport } from "react-icons/hi";
import { TbReportAnalytics } from "react-icons/tb";
import { useEmployee } from "../../contexts/EmployeeContext";
import dayjs from "dayjs";

const ReportByEmployee = () => {
  const {
    state: { theme, themeStyles },
  } = useTheme();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const {
    state: {
      loading,
      reportsByEmployees: { BOGOTA: dataBogota, HELGUERA: dataHelguera },
    },
    dispatch: dispatchSale,
  } = useSale();
  const {
    state: { employees },
  } = useEmployee();
  const [filters, setFilters] = useState({
    typeDate: "byDate",
    startDate: formatDateToYYYYMMDD(new Date()),
    endDate: formatDateToYYYYMMDD(new Date()),
    month: Number(currentMonth),
    year: currentYear,
    employees: [],
  });
  const [isModalGenerarOpen, setIsModalGenerarOpen] = useState(false);

  const downloadExcelByEmployee = async () => {
    const { wb, ws } = createWorkbook("Reporte Empleado");
    xlColWidths(ws, [35, 14, 14, 14, 14, 14]);

    const addSectionTitle = (text: string) => {
      const row = ws.addRow([text]);
      xlSectionTitle(row);
    };

    const addSubTitle = (text: string) => {
      const row = ws.addRow([text]);
      row.getCell(1).font = { bold: true, size: 9 };
    };

    const processStore = (storeData: any, storeName: string) => {
      if (!storeData?.byItemWeek?.employees) return;

      addSectionTitle(`=== ${storeName.toUpperCase()} ===`);
      ws.addRow([]);

      // 1. Prendas por semana
      addSubTitle("Prendas por semana (Venta local)");
      const empNames = storeData.byItemWeek.employees.map((e: any) => e.employee);
      const hRow1 = ws.addRow(["Semana", ...empNames]);
      xlHeader(hRow1, 1, 1 + empNames.length);

      const allWeeks = [
        ...new Set(
          storeData.byItemWeek.employees.flatMap((e: any) =>
            e.data.map((d: any) => d.week)
          )
        ),
      ].sort((a: any, b: any) => (a as number) - (b as number));

      allWeeks.forEach((week: any, i) => {
        const weekLabel =
          storeData.byItemWeek.employees
            .flatMap((e: any) => e.data)
            .find((d: any) => d.week === week)?.weekdays || `Semana ${week}`;
        const vals: any[] = [weekLabel];
        storeData.byItemWeek.employees.forEach((emp: any) => {
          const match = emp.data.find((d: any) => d.week === week);
          vals.push(match ? (match.devolutionItems > 0 ? `${match.items || 0} / ${match.devolutionItems}` : `${match.items || 0}`) : "-");
        });
        const row = ws.addRow(vals);
        xlData(row, 1, vals.length, i % 2 !== 0);
      });

      const totalWeekVals: any[] = ["Total:"];
      storeData.byItemWeek.employees.forEach((emp: any) => {
        const t = emp.data.reduce((s: number, d: any) => s + (d.items ?? 0), 0);
        const td = emp.data.reduce((s: number, d: any) => s + (d.devolutionItems ?? 0), 0);
        totalWeekVals.push(td > 0 ? `${t} / ${td}` : `${t}`);
      });
      const tRow1 = ws.addRow(totalWeekVals);
      xlTotal(tRow1, 1, totalWeekVals.length);

      const sumRow1 = ws.addRow([`Total: ${storeData.byItemWeek.totalItems}${storeData.byItemWeek.totalDevolutionItems > 0 ? ` / ${storeData.byItemWeek.totalDevolutionItems} dev.` : ""}`]);
      sumRow1.getCell(1).font = { bold: true };
      ws.addRow([]);

      // 2. Cantidad de pedidos
      if (storeData.byQuantitySalePedido?.employees) {
        addSubTitle("Cantidad de pedidos");
        const pedidoEmps = storeData.byQuantitySalePedido.employees.map((e: any) => e.employee);
        const hRow2 = ws.addRow(pedidoEmps);
        xlVendor(hRow2, 1, pedidoEmps.length);
        const dRow2 = ws.addRow(storeData.byQuantitySalePedido.employees.map((e: any) => e.data[0]?.quantity || 0));
        xlData(dRow2, 1, pedidoEmps.length);
        const sumRow2 = ws.addRow([`Total: ${storeData.byQuantitySalePedido.totalItems}`]);
        sumRow2.getCell(1).font = { bold: true };
        ws.addRow([]);
      }

      // 3. Prendas por concepto
      if (storeData.byItemConceptEmployee?.employees) {
        addSubTitle("Prendas por concepto");
        const conceptEmps = storeData.byItemConceptEmployee.employees.map((e: any) => e.employee);
        const hRow3 = ws.addRow(["Concepto", ...conceptEmps]);
        xlHeader(hRow3, 1, 1 + conceptEmps.length);

        const concepts = ["Venta local", "Pedido (Retira local)", "Pedido (Envio)"];
        concepts.forEach((concept, i) => {
          const vals: any[] = [concept];
          storeData.byItemConceptEmployee.employees.forEach((emp: any) => {
            const match = emp.data.find((d: any) => d.concept === concept);
            vals.push(match ? (match.devolutionItems > 0 ? `${match.items || 0} / ${match.devolutionItems}` : `${match.items || 0}`) : "-");
          });
          const row = ws.addRow(vals);
          xlData(row, 1, vals.length, i % 2 !== 0);
        });

        const totalConceptVals: any[] = ["Total:"];
        storeData.byItemConceptEmployee.employees.forEach((emp: any) => {
          const t = emp.data.reduce((s: number, d: any) => s + (d.items ?? 0), 0);
          const td = emp.data.reduce((s: number, d: any) => s + (d.devolutionItems ?? 0), 0);
          totalConceptVals.push(td > 0 ? `${t} / ${td}` : `${t}`);
        });
        const tRow3 = ws.addRow(totalConceptVals);
        xlTotal(tRow3, 1, totalConceptVals.length);

        const sumRow3 = ws.addRow([`Total: ${storeData.byItemConceptEmployee.totalItems}${storeData.byItemConceptEmployee.totalDevolutionItems > 0 ? ` / ${storeData.byItemConceptEmployee.totalDevolutionItems} dev.` : ""}`]);
        sumRow3.getCell(1).font = { bold: true };
        ws.addRow([]);
      }

      // 4. Resumen por concepto
      if (storeData.byItemConcept?.concepts) {
        addSubTitle("Resumen por concepto");
        const hRow4 = ws.addRow(["Concepto", "Prendas", "Dev."]);
        xlHeader(hRow4, 1, 3);
        storeData.byItemConcept.concepts.forEach((c: any, i: number) => {
          const row = ws.addRow([c.concept, c.items, c.devolutionItems || 0]);
          xlData(row, 1, 3, i % 2 !== 0);
        });
        const tRow4 = ws.addRow(["Total:", storeData.byItemConcept.totalItems, storeData.byItemConcept.totalDevolutionItems || 0]);
        xlTotal(tRow4, 1, 3);
        ws.addRow([]);
      }

      // Section total
      const totalPrendas = storeData.byItemConcept?.totalItems ?? 0;
      const totalDev = storeData.byItemConcept?.totalDevolutionItems ?? 0;
      const storeTotal = ws.addRow([`Total ${storeName}: ${totalPrendas} prendas${totalDev > 0 ? ` / ${totalDev} devoluciones` : ""}`]);
      storeTotal.getCell(1).font = { bold: true, color: { argb: "FF0891B2" }, size: 10 };
      ws.addRow([]);
      ws.addRow([]);
    };

    processStore(dataBogota, "Bogotá");
    processStore(dataHelguera, "Helguera");

    // Grand total
    const grandTotal = (dataBogota?.byItemConcept?.totalItems ?? 0) + (dataHelguera?.byItemConcept?.totalItems ?? 0);
    const grandDev = (dataBogota?.byItemConcept?.totalDevolutionItems ?? 0) + (dataHelguera?.byItemConcept?.totalDevolutionItems ?? 0);
    const grandRow = ws.addRow([`TOTAL GENERAL: ${grandTotal} prendas${grandDev > 0 ? ` / ${grandDev} devoluciones` : ""}`]);
    grandRow.getCell(1).font = { bold: true, color: { argb: "FF0891B2" }, size: 12 };

    await downloadWorkbook(wb, getExcelFileName("reporte-empleado"));
  };

  // Columna para "Prendas por semana" - nombre de empleado como header
  // Formato: "items / devolutionItems" donde devolutionItems está en rojo
  const columnsByItemWeek = (employee: string) => {
    return [
      {
        title: employee,
        dataIndex: "itemsDisplay",
        sumAcc: false,
      },
    ];
  };

  // Columna para "Prendas" por concepto - nombre de empleado como header
  const columnsByItemConceptEmployee = (employee: string, sumAcc = true) => {
    return [
      {
        title: employee,
        dataIndex: "itemsDisplay",
        sumAcc: false,
      },
    ];
  };

  // Helper para procesar datos y agregar campo itemsDisplay
  const processDataWithDevolutions = (data: any[]) => {
    return data.map((item) => ({
      ...item,
      itemsDisplay:
        item.devolutionItems > 0
          ? `${item.items || 0} / ${item.devolutionItems}`
          : `${item.items || 0}`,
    }));
  };

  return (
    <>
      <div
        className={`h-15 relative p-1 border ${themeStyles[theme].tailwindcss.border}`}
      >
        <div className="inline-block">
          <label
            onClick={() => {
              setFilters((currentFilters: any) => ({
                ...currentFilters,
                typeDate: "byDate",
              }));
            }}
            className="ml-10"
          >
            Por Fechas:
          </label>
          <input
            type="checkbox"
            checked={filters.typeDate === "byDate"}
            onChange={() => {
              setFilters((currentFilters: any) => ({
                ...currentFilters,
                typeDate: "byDate",
              }));
            }}
            className="ml-1 mr-2"
          />

          <label
            onClick={() => {
              setFilters((currentFilters: any) => ({
                ...currentFilters,
                typeDate: "byMonthYear",
              }));
            }}
            className="ml-10"
          >
            Por Mes/Año:
          </label>
          <input
            type="checkbox"
            checked={filters.typeDate === "byMonthYear"}
            onChange={() => {
              setFilters((currentFilters: any) => ({
                ...currentFilters,
                typeDate: "byMonthYear",
              }));
            }}
            className="ml-1 mr-5"
          />
          {filters.typeDate === "byDate" && (
            <div className="inline-block">
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
          )}
          {filters.typeDate === "byMonthYear" && (
            <>
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
                options={months.map((month: any, index: any) => ({
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
                options={[
                  {
                    value: 2024,
                    label: 2024,
                  },
                  {
                    value: 2025,
                    label: 2025,
                  },
                  {
                    value: 2026,
                    label: 2026,
                  },
                ]}
              />
            </>
          )}
        </div>
        <div className="ml-2 inline-block">
          <label className="mr-1">Vendedor:</label>

          <Select
            mode="multiple"
            value={filters.employees.length ? filters.employees : ["Todos"]}
            className={themeStyles[theme].classNameSelector}
            dropdownStyle={themeStyles[theme].dropdownStylesCustom}
            popupClassName={themeStyles[theme].classNameSelectorItem}
            style={{
              width: "300px",
            }}
            onSelect={(value: any) =>
              setFilters((props: any) => ({
                ...props,
                employees: value.length
                  ? props.employees.includes(value)
                    ? props.employees.filter(
                        (employee: any) => employee !== value
                      )
                    : [...props.employees, value]
                  : [],
              }))
            }
            onDeselect={(value: any) =>
              setFilters((props: any) => ({
                ...props,
                employees: props.employees.filter(
                  (employee: any) => employee !== value
                ),
              }))
            }
            options={[
              { label: "Todos", value: "" },
              ...employees.map((data: any) => ({
                value: data.name,
                label: data.name,
              })),
            ]}
          />
        </div>

        <div className="ml-2 inline-block">
          <div
            className={`inline-block px-4 py-1 rounded-md border text-white select-none bg-[#1b78e2] border-[#1b78e2] hover:cursor-pointer hover:opacity-80 transition-opacity flex items-center mx-auto`}
            onClick={() =>
              !loading &&
              dispatchSale(
                saleActions.getReportsByEmployees(filters)(dispatchSale)
              )
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

        <div className="inline-block">
          <div
            className="w-25 h-8 ml-2 bg-cyan-700 hover:bg-cyan-800 hover:cursor-pointer text-white px-4 py-1 rounded-md flex items-center justify-center select-none"
            onClick={() => setIsModalGenerarOpen(true)}
          >
            Generar
          </div>
          <ModalGenerar
            isOpen={isModalGenerarOpen}
            onClose={() => setIsModalGenerarOpen(false)}
            title="Generar Reporte Empleado"
            pdfDocument={
              <PdfReportByEmployee
                timePeriod={`Reporte de prendas por empleado del periodo - ${
                  filters.typeDate === "byDate"
                    ? `${filters.startDate} - ${filters.endDate}`
                    : months[filters.month]
                }`}
                dataBogota={dataBogota}
                dataHelguera={dataHelguera}
              />
            }
            pdfFileName={`informe-prendas-por-empleado-${
              filters.typeDate === "byDate"
                ? `${filters.startDate}-${filters.endDate}`
                : months[filters.month]
            }.pdf`}
            onExcel={downloadExcelByEmployee}
          />
        </div>
      </div>
      <div>
        <div className="mt-5 h-[70vh] mx-auto max-w overflow-hidden overflow-y-auto overflow-x-auto">
          <div className="mt-2 text-lg font-semibold border-b border-gray-400 pb-1">
            BOGOTA
          </div>
          <div className="my-2 text-[0.75rem] text-gray-400 ">
            Prendas por semana (Venta local):
          </div>
          <div className=" max-w overflow-hidden overflow-y-auto overflow-x-auto flex flex-no-wrap">
            {dataBogota.byItemWeek.employees.map(
              (saleByItemWeek: any, idx: number) => (
                <div className={`mr-0.5 text-xs`} key={idx + "byItemWeek"}>
                  <EditableTable
                    data={processDataWithDevolutions(saleByItemWeek.data)}
                    columns={
                      idx === 0
                        ? [
                            {
                              title:
                                "\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0Semana\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0",
                              dataIndex: "weekdays",
                            },
                            ...columnsByItemWeek(saleByItemWeek.employee),
                          ]
                        : columnsByItemWeek(saleByItemWeek.employee)
                    }
                    table={`-byItemWeek`}
                  />
                </div>
              )
            )}
          </div>
          <div className="my-2 text-[0.9rem] border-b border-gray-600 pb-1">
            Total: {dataBogota.byItemWeek.totalItems}
            {dataBogota.byItemWeek.totalDevolutionItems > 0 && (
              <span style={{ color: "#dc2626" }}>
                {" "}
                / {dataBogota.byItemWeek.totalDevolutionItems}
              </span>
            )}
          </div>

          <div className="my-2 text-[0.75rem] text-gray-400 ">
            Por periodo seleccionado:{" "}
            {filters.typeDate === "byDate"
              ? `${dayjs(filters.startDate).format("DD/MM/YYYY")} - ${dayjs(
                  filters.endDate
                ).format("DD/MM/YYYY")}`
              : months[filters.month]}
          </div>
          <div className="my-2 text-[0.8rem] text-gray-300 ">
            Cantidad de pedidos:
          </div>
          <div className=" max-w overflow-hidden overflow-y-auto overflow-x-auto flex flex-no-wrap">
            {dataBogota.byQuantitySalePedido.employees.map(
              (saleByQuantitySalePedido: any, idx: number) => (
                <div
                  className={`mr-0.5 text-xs`}
                  key={idx + "byQuantitySalePedido"}
                >
                  <EditableTable
                    data={saleByQuantitySalePedido.data}
                    columns={[
                      {
                        title: saleByQuantitySalePedido.employee,
                        dataIndex: "quantity",
                      },
                    ]}
                    table={`-byQuantitySalePedido`}
                  />
                </div>
              )
            )}
          </div>
          <div className="my-2 text-[0.9rem] border-b border-gray-700 pb-1">
            Total: {dataBogota.byQuantitySalePedido.totalItems}
          </div>

          <div className="my-2 text-[0.8rem] text-gray-300 ">Prendas:</div>

          <div className=" max-w overflow-hidden overflow-y-auto overflow-x-auto flex flex-no-wrap">
            {dataBogota.byItemConceptEmployee.employees.map(
              (saleByItemConceptEmployee: any, idx: number) => (
                <div
                  className={`mr-0.5 text-xs`}
                  key={idx + "byItemConceptEmployee"}
                >
                  <EditableTable
                    data={processDataWithDevolutions(saleByItemConceptEmployee.data)}
                    columns={
                      idx === 0
                        ? [
                            { title: "Concepto", dataIndex: "concept" },
                            ...columnsByItemConceptEmployee(
                              saleByItemConceptEmployee.employee
                            ),
                          ]
                        : columnsByItemConceptEmployee(
                            saleByItemConceptEmployee.employee
                          )
                    }
                    table={`-byItemConceptEmployee`}
                  />
                </div>
              )
            )}
          </div>
          <div className="my-2 text-[0.9rem] border-b border-gray-700 pb-1">
            Total: {dataBogota.byItemConceptEmployee.totalItems}
            {dataBogota.byItemConceptEmployee.totalDevolutionItems > 0 && (
              <span style={{ color: "#dc2626" }}>
                {" "}
                / {dataBogota.byItemConceptEmployee.totalDevolutionItems}
              </span>
            )}
          </div>
          <div className="my-2 text-[0.8rem] text-gray-300 ">
            Total por concepto:
          </div>
          <div className=" max-w overflow-hidden overflow-y-auto overflow-x-auto flex flex-no-wrap border-b border-gray-700 pb-1">
            <div className={`mr-0.5 text-xs`} key={"0-byItemConcept"}>
              <EditableTable
                data={dataBogota.byItemConcept.concepts}
                columns={[
                  {
                    title: "Concepto",
                    dataIndex: "concept",
                  },
                  {
                    title: "Prendas",
                    dataIndex: "items",
                    sumAcc: true,
                  },
                  {
                    title: "Dev",
                    dataIndex: "devolutionItems",
                    sumAcc: true,
                    color: "#e23535",
                  },
                ]}
                table={`0-byItemConcept`}
              />
            </div>
          </div>

          <div className="mt-2 text-lg font-semibold border-b border-gray-400 pb-1">
            HELGUERA
          </div>
          <div className="my-2 text-[0.75rem] text-gray-400 ">
            Prendas por semana (Venta local):
          </div>
          <div className=" max-w overflow-hidden overflow-y-auto overflow-x-auto flex flex-no-wrap">
            {dataHelguera.byItemWeek.employees.map(
              (saleByItemWeek: any, idx: number) => (
                <div className={`mr-0.5 text-xs`} key={idx + "byItemWeek"}>
                  <EditableTable
                    data={processDataWithDevolutions(saleByItemWeek.data)}
                    columns={
                      idx === 0
                        ? [
                            {
                              title:
                                "\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0Semana\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0",
                              dataIndex: "weekdays",
                            },
                            ...columnsByItemWeek(saleByItemWeek.employee),
                          ]
                        : columnsByItemWeek(saleByItemWeek.employee)
                    }
                    table={`-byItemWeek`}
                  />
                </div>
              )
            )}
          </div>
          <div className="my-2 text-[0.9rem] border-b border-gray-600 pb-1">
            Total: {dataHelguera.byItemWeek.totalItems}
            {dataHelguera.byItemWeek.totalDevolutionItems > 0 && (
              <span style={{ color: "#dc2626" }}>
                {" "}
                / {dataHelguera.byItemWeek.totalDevolutionItems}
              </span>
            )}
          </div>

          <div className="my-2 text-[0.75rem] text-gray-400 ">
            Por periodo seleccionado:{" "}
            {filters.typeDate === "byDate"
              ? `${dayjs(filters.startDate).format("DD/MM/YYYY")} - ${dayjs(
                  filters.endDate
                ).format("DD/MM/YYYY")}`
              : months[filters.month]}
          </div>
          <div className="my-2 text-[0.8rem] text-gray-300 ">
            Cantidad de pedidos:
          </div>
          <div className=" max-w overflow-hidden overflow-y-auto overflow-x-auto flex flex-no-wrap">
            {dataHelguera.byQuantitySalePedido.employees.map(
              (saleByQuantitySalePedido: any, idx: number) => (
                <div
                  className={`mr-0.5 text-xs`}
                  key={idx + "byQuantitySalePedido"}
                >
                  <EditableTable
                    data={saleByQuantitySalePedido.data}
                    columns={[
                      {
                        title: saleByQuantitySalePedido.employee,
                        dataIndex: "quantity",
                      },
                    ]}
                    table={`-byQuantitySalePedido`}
                  />
                </div>
              )
            )}
          </div>
          <div className="my-2 text-[0.9rem] border-b border-gray-700 pb-1">
            Total: {dataHelguera.byQuantitySalePedido.totalItems}
          </div>

          <div className="my-2 text-[0.8rem] text-gray-300 ">Prendas:</div>

          <div className=" max-w overflow-hidden overflow-y-auto overflow-x-auto flex flex-no-wrap">
            {dataHelguera.byItemConceptEmployee.employees.map(
              (saleByItemConceptEmployee: any, idx: number) => (
                <div
                  className={`mr-0.5 text-xs`}
                  key={idx + "byItemConceptEmployee"}
                >
                  <EditableTable
                    data={processDataWithDevolutions(saleByItemConceptEmployee.data)}
                    columns={
                      idx === 0
                        ? [
                            { title: "Concepto", dataIndex: "concept" },
                            ...columnsByItemConceptEmployee(
                              saleByItemConceptEmployee.employee,
                              true
                            ),
                          ]
                        : columnsByItemConceptEmployee(
                            saleByItemConceptEmployee.employee,
                            true
                          )
                    }
                    table={`-byItemConceptEmployee`}
                  />
                </div>
              )
            )}
          </div>
          <div className="my-2 text-[0.9rem] border-b border-gray-700 pb-1">
            Total: {dataHelguera.byItemConceptEmployee.totalItems}
            {dataHelguera.byItemConceptEmployee.totalDevolutionItems > 0 && (
              <span style={{ color: "#dc2626" }}>
                {" "}
                / {dataHelguera.byItemConceptEmployee.totalDevolutionItems}
              </span>
            )}
          </div>
          <div className="my-2 text-[0.8rem] text-gray-300 ">
            Total por concepto:
          </div>
          <div className=" max-w overflow-hidden overflow-y-auto overflow-x-auto flex flex-no-wrap border-b border-gray-700 pb-1">
            <div className={`mr-0.5 text-xs`} key={"0-byItemConcept"}>
              <EditableTable
                data={dataHelguera.byItemConcept.concepts}
                columns={[
                  {
                    title: "Concepto",
                    dataIndex: "concept",
                  },
                  {
                    title: "Prendas",
                    dataIndex: "items",
                    sumAcc: true,
                  },
                  {
                    title: "Dev",
                    dataIndex: "devolutionItems",
                    sumAcc: true,
                    color: "#dc2626",
                  },
                ]}
                table={`0-byItemConcept`}
              />
            </div>
          </div>
          <div className="mt-2 text-lg font-semibold border-b border-gray-400 pb-1">
            Total de Prendas (Bogota y Helguera):{" "}
            {dataBogota.byItemConcept.totalItems +
              dataHelguera.byItemConcept.totalItems}
            {(dataBogota.byItemConcept.totalDevolutionItems || 0) +
              (dataHelguera.byItemConcept.totalDevolutionItems || 0) >
              0 && (
              <span style={{ color: "#dc2626" }}>
                {" "}
                /{" "}
                {(dataBogota.byItemConcept.totalDevolutionItems || 0) +
                  (dataHelguera.byItemConcept.totalDevolutionItems || 0)}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

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

  // Columnas para venta local - con devoluciones
  const columnsLocalSalesByEmployee = [
    { title: "Prendas", dataIndex: "items", sumAcc: true },
    {
      title: "Dev",
      dataIndex: "devolutionItems",
      sumAcc: true,
      color: "#dc2626",
    },
    {
      title: "Venta",
      dataIndex: "cash",
      format: (number: any) => `$${formatCurrency(number)}`,
      sumAcc: true,
      applyFormat: true,
    },
  ];

  // Columnas para pedidos - con devoluciones
  const columnsLocalPedidosByEmployee = [
    { title: "Prendas", dataIndex: "items", sumAcc: true },
    {
      title: "Dev",
      dataIndex: "devolutionItems",
      sumAcc: true,
      color: "#dc2626",
    },
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

const ReportGeneral = () => {
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
  const [isModalGenerarWeek, setIsModalGenerarWeek] = useState<number | null>(null);

  const downloadExcelReportWeek = async (report: any, typeSale: string) => {
    const isLocal = typeSale === "local";
    const colCount = isLocal ? 6 : 6;

    const { wb, ws } = createWorkbook(`Semana ${report.week}`);
    xlColWidths(ws, [12, 9, 9, 12, 12, 12]);

    // === RESUMEN GENERAL ===
    const titleRow1 = ws.addRow(["RESUMEN GENERAL"]);
    xlSectionTitle(titleRow1);
    ws.mergeCells(titleRow1.number, 1, titleRow1.number, colCount);
    ws.addRow([]);

    if (isLocal) {
      const hRow = ws.addRow(["Fecha", "Prendas", "Dev", "Gastos", "Venta", "Total Caja"]);
      xlHeader(hRow, 1, colCount);
      const gt = { items: 0, dev: 0, gastos: 0, venta: 0, totalBox: 0 };
      (report.salesGeneral || []).forEach((r: any, i: number) => {
        gt.items += r.items || 0;
        gt.dev += r.devolutionItems || 0;
        gt.gastos += r.outgoings || 0;
        gt.venta += r.cash || 0;
        gt.totalBox += r.totalBox || 0;
        const row = ws.addRow([r.date || "-", r.items || 0, r.devolutionItems || 0, r.outgoings || 0, r.cash || 0, r.totalBox || 0]);
        xlData(row, 1, colCount, i % 2 !== 0);
      });
      const tRow = ws.addRow(["Total", gt.items, gt.dev, gt.gastos, gt.venta, gt.totalBox]);
      xlTotal(tRow, 1, colCount);
    } else {
      const hRow = ws.addRow(["Fecha", "Prendas", "Dev", "Efectivo", "Transfer", "Total"]);
      xlHeader(hRow, 1, colCount);
      const gt = { items: 0, dev: 0, cash: 0, transfer: 0, total: 0 };
      (report.salesGeneral || []).forEach((r: any, i: number) => {
        gt.items += r.items || 0;
        gt.dev += r.devolutionItems || 0;
        gt.cash += r.cash || 0;
        gt.transfer += r.transfer || 0;
        gt.total += r.total || 0;
        const row = ws.addRow([r.date || "-", r.items || 0, r.devolutionItems || 0, r.cash || 0, r.transfer || 0, r.total || 0]);
        xlData(row, 1, colCount, i % 2 !== 0);
      });
      const tRow = ws.addRow(["Total", gt.items, gt.dev, gt.cash, gt.transfer, gt.total]);
      xlTotal(tRow, 1, colCount);
    }

    ws.addRow([]);
    ws.addRow([]);

    // === DETALLE POR EMPLEADO ===
    const titleRow2 = ws.addRow(["DETALLE POR EMPLEADO"]);
    xlSectionTitle(titleRow2);
    ws.mergeCells(titleRow2.number, 1, titleRow2.number, colCount);
    ws.addRow([]);

    (report.salesByEmployees || []).forEach((empData: any) => {
      const empRow = ws.addRow([empData.employee]);
      xlVendor(empRow, 1, isLocal ? 4 : colCount);

      if (isLocal) {
        const hRow = ws.addRow(["Fecha", "Prendas", "Dev", "Venta"]);
        xlHeader(hRow, 1, 4);
        const et = { items: 0, dev: 0, total: 0 };
        (empData.sales || []).forEach((sale: any, i: number) => {
          const venta = sale.total || sale.cash || 0;
          et.items += sale.items || 0;
          et.dev += sale.devolutionItems || 0;
          et.total += venta;
          const row = ws.addRow([sale.date || "-", sale.items || 0, sale.devolutionItems || 0, venta]);
          xlData(row, 1, 4, i % 2 !== 0);
        });
        const tRow = ws.addRow(["Total", et.items, et.dev, et.total]);
        xlTotal(tRow, 1, 4);
      } else {
        const hRow = ws.addRow(["Fecha", "Prendas", "Dev", "Efectivo", "Transfer", "Total"]);
        xlHeader(hRow, 1, colCount);
        const et = { items: 0, dev: 0, cash: 0, transfer: 0, total: 0 };
        (empData.sales || []).forEach((sale: any, i: number) => {
          et.items += sale.items || 0;
          et.dev += sale.devolutionItems || 0;
          et.cash += sale.cash || 0;
          et.transfer += sale.transfer || 0;
          et.total += sale.total || 0;
          const row = ws.addRow([sale.date || "-", sale.items || 0, sale.devolutionItems || 0, sale.cash || 0, sale.transfer || 0, sale.total || 0]);
          xlData(row, 1, colCount, i % 2 !== 0);
        });
        const tRow = ws.addRow(["Total", et.items, et.dev, et.cash, et.transfer, et.total]);
        xlTotal(tRow, 1, colCount);
      }

      ws.addRow([]);
    });

    await downloadWorkbook(wb, getExcelFileName(`reporte-semana-${report.week}`));
  };

  // Columnas para venta local - con devoluciones
  const columnsLocalSalesByDay = [
    { title: "Fecha", dataIndex: "date" },
    { title: "Prendas", dataIndex: "items", sumAcc: true },
    {
      title: "Dev",
      dataIndex: "devolutionItems",
      sumAcc: true,
      color: "#dc2626",
    },
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

  // Columnas para pedidos - AHORA CON DEVOLUCIONES
  const columnsPedidoSalesByDay = [
    { title: "Fecha", dataIndex: "date" },
    { title: "Prendas", dataIndex: "items", sumAcc: true },
    {
      title: "Dev",
      dataIndex: "devolutionItems",
      sumAcc: true,
      color: "#dc2626",
    },
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
            options={months.map((month: any, index: any) => ({
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
            options={[
              {
                value: 2024,
                label: 2024,
              },
              {
                value: 2025,
                label: 2025,
              },
              {
                value: 2026,
                label: 2026,
              },
            ]}
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
                  <div className="w-[55vh] mr-10" key={idx + "byDay"}>
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

                  <div
                    className="w-25 h-8 ml-2 bg-cyan-700 hover:bg-cyan-800 hover:cursor-pointer text-white px-4 py-1 rounded-md flex items-center justify-center select-none"
                    onClick={() => setIsModalGenerarWeek(report.week)}
                  >
                    Generar
                  </div>
                  <ModalGenerar
                    isOpen={isModalGenerarWeek === report.week}
                    onClose={() => setIsModalGenerarWeek(null)}
                    title={`Generar Semana ${report.week}`}
                    pdfDocument={
                      <PdfReportByWeek
                        week={report.week}
                        store={mappingListStore[filters.store]}
                        type={reports.typeSale}
                        dataWeek={report.salesGeneral}
                        salesByEmployees={report.salesByEmployees}
                      />
                    }
                    pdfFileName={`informe-${reports.typeSale}-semana-${report.week}.pdf`}
                    onExcel={() => downloadExcelReportWeek(report, reports.typeSale)}
                  />
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

const mappingTabs: any = {
  "Reporte General": {
    title: "Reporte General",
    icon: <HiDocumentReport />,
    container: <ReportGeneral />,
  },
  "Reporte por Empleado": {
    title: "Reporte por Empleado",
    icon: <TbReportAnalytics />,
    container: <ReportByEmployee />,
  },
};

const ReportsContainer = () => {
  const [activeTab, setActiveTab] = useState("Reporte General");
  const {
    state: { theme, themeStyles },
  } = useTheme();

  return (
    <div className="mx-auto">
      <div className="w-1/2 h-[5vh] flex mb-4">
        {Object.values(mappingTabs).map((tab: any) => (
          <button
            key={tab.title}
            className={`flex-1 text-lg ${
              activeTab === tab.title
                ? "bg-[#1BA1E2] text-white"
                : themeStyles[theme].tailwindcss.menuTab
            }`}
            onClick={() => setActiveTab(tab.title)}
          >
            <div className="flex items-center justify-center">
              {tab.icon}
              <span className="ml-2">{tab.title}</span>
            </div>
          </button>
        ))}
      </div>

      {mappingTabs[activeTab].container}
    </div>
  );
};

export default ReportsContainer;
