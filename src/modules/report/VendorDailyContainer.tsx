import { useState } from "react";
import { DatePicker, Select } from "antd";
import dayjs from "dayjs";
import { MdClose } from "react-icons/md";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { useEmployee } from "../../contexts/EmployeeContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useUser } from "../../contexts/UserContext";
import { listStore, dateFormat, mappingListStore } from "../../utils/constants";
import Api from "../../services/Api";
import Spinner from "../../components/Spinner";
import ModalGenerar from "../../components/ModalGenerar";
import PdfVendorDaily from "./PdfVendorDaily";
import {
  createWorkbook,
  downloadWorkbook,
  getExcelFileName,
  xlColWidths,
  xlHeader,
  xlTotal,
  xlData,
  XL,
} from "../../utils/excelUtils";

type DayData = { jeans: number; remeras: number; devJeans: number; devRemeras: number };
type Employee = {
  name: string;
  store: string;
  days: Record<string, DayData>;
  subtotals: { jeans: number; remeras: number; devJeans: number; devRemeras: number };
};
type ReportData = {
  dates: string[];
  employees: Employee[];
  dailyTotals: Record<string, DayData>;
  grandTotals: { jeans: number; remeras: number; devJeans: number; devRemeras: number };
};
type SortConfig = { key: string; direction: "asc" | "desc" | null };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  initialStore?: string;
}

const VendorDailyContainer = ({ isOpen, onClose, initialDate, initialStore }: Props) => {
  const { state: { user } } = useUser();
  const isAdmin = user?.role === "ADMIN";
  const userStore = user?.store || "ALL";

  const today = initialDate ?? dayjs().format("YYYY-MM-DD");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [store, setStore] = useState(isAdmin ? (initialStore ?? "ALL") : userStore);
  const [employee, setEmployee] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportData | null>(null);
  const [showGenerar, setShowGenerar] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "", direction: null });

  const { state: { employees } } = useEmployee();
  const { state: { theme, themeStyles } } = useTheme();
  const ts = themeStyles[theme];

  const filteredEmployees = (isAdmin && store === "ALL")
    ? employees
    : employees.filter((e: any) => e.store === (isAdmin ? store : userStore));

  if (!isOpen) return null;

  const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const getDayName = (dateStr: string): string => {
    const year = dayjs(startDate).year();
    const [dd, mm] = dateStr.split("/");
    return DAY_NAMES[dayjs(`${year}-${mm}-${dd}`).day()];
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const { data: result } = await Api.getVendorDailyReport({ startDate, endDate, store, employee });
      setData(result);
      setSortConfig({ key: "", direction: null });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        if (prev.direction === "desc") return { key: "", direction: null };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <FaSort className="ml-1 text-gray-400 text-[10px]" />;
    if (sortConfig.direction === "asc") return <FaSortUp className="ml-1 text-cyan-300 text-[10px]" />;
    return <FaSortDown className="ml-1 text-cyan-300 text-[10px]" />;
  };

  const getSortedEmployees = (emps: Employee[]): Employee[] => {
    if (!sortConfig.key || !sortConfig.direction) return emps;
    const dir = sortConfig.direction === "asc" ? 1 : -1;
    return [...emps].sort((a, b) => {
      if (sortConfig.key === "name") {
        return dir * a.name.localeCompare(b.name);
      }
      if (sortConfig.key === "total") {
        return dir * (a.subtotals.jeans - b.subtotals.jeans);
      }
      // date column — sort by jeans for that day
      const aVal = a.days[sortConfig.key]?.jeans ?? 0;
      const bVal = b.days[sortConfig.key]?.jeans ?? 0;
      return dir * (aVal - bVal);
    });
  };

  const storeName = mappingListStore[store] || "Todas";
  const timePeriod = `${dayjs(startDate).format("DD/MM/YYYY")} — ${dayjs(endDate).format("DD/MM/YYYY")}`;

  const sortedEmployees = data ? getSortedEmployees(data.employees) : [];

  const REPORT_TITLE = "Listado de Prendas/Dev Diario por Vendedor";

  const handleExcel = async () => {
    if (!data) return;
    const { wb, ws } = createWorkbook("Prend Dev Vendedor");
    const { dates, dailyTotals, grandTotals } = data;
    const totalCols = 2 + dates.length + 1;

    xlColWidths(ws, [22, 12, ...dates.map(() => 10), 11]);

    const titleRow = ws.addRow([`${REPORT_TITLE} — ${storeName} | ${timePeriod}`]);
    titleRow.getCell(1).font = { bold: true, color: { argb: XL.CYAN }, size: 11 };
    ws.addRow([]);

    // Header — date cells show "DayName\nDD/MM"
    const headerRow = ws.addRow(["Vendedor", "Tipo", ...dates.map((d) => `${getDayName(d)}\n${d}`), "Total"]);
    xlHeader(headerRow, 1, totalCols);
    for (let c = 3; c <= 2 + dates.length; c++) {
      headerRow.getCell(c).alignment = { wrapText: true, horizontal: "center", vertical: "middle" };
    }

    sortedEmployees.forEach((emp) => {
      const baseRowNum = ws.rowCount + 1;

      // Row 1: Jeans / Dev Jeans stacked
      const jeansRow = ws.addRow([
        emp.name,
        "Jeans\nDev Jeans",
        ...dates.map((d) => `${emp.days[d]?.jeans ?? 0}\n${emp.days[d]?.devJeans ? `-${emp.days[d].devJeans}` : "-"}`),
        `${emp.subtotals.jeans}\n${emp.subtotals.devJeans ? `-${emp.subtotals.devJeans}` : "-"}`,
      ]);
      xlData(jeansRow, 1, totalCols);
      jeansRow.getCell(1).font = { bold: true, size: 8 };
      for (let c = 2; c <= totalCols; c++) {
        jeansRow.getCell(c).alignment = { wrapText: true, horizontal: "center", vertical: "top" };
      }

      // Row 2: Rem / Dev Rem stacked
      const remRow = ws.addRow([
        "",
        "Rem\nDev Rem",
        ...dates.map((d) => `${emp.days[d]?.remeras ?? 0}\n${emp.days[d]?.devRemeras ? `-${emp.days[d].devRemeras}` : "-"}`),
        `${emp.subtotals.remeras}\n${emp.subtotals.devRemeras ? `-${emp.subtotals.devRemeras}` : "-"}`,
      ]);
      xlData(remRow, 1, totalCols);
      for (let c = 2; c <= totalCols; c++) {
        remRow.getCell(c).alignment = { wrapText: true, horizontal: "center", vertical: "top" };
      }

      // Merge Vendedor cell across both rows
      ws.mergeCells(baseRowNum, 1, baseRowNum + 1, 1);
      ws.getCell(baseRowNum, 1).alignment = { vertical: "middle", wrapText: true };
    });

    // Grand totals — 2 rows
    const gtBaseRow = ws.rowCount + 1;

    const gtJRow = ws.addRow([
      "TOTAL",
      "Jeans\nDev Jeans",
      ...dates.map((d) => `${dailyTotals[d]?.jeans ?? 0}\n${dailyTotals[d]?.devJeans ? `-${dailyTotals[d].devJeans}` : "-"}`),
      `${grandTotals.jeans}\n${grandTotals.devJeans ? `-${grandTotals.devJeans}` : "-"}`,
    ]);
    xlTotal(gtJRow, 1, totalCols);
    for (let c = 2; c <= totalCols; c++) {
      gtJRow.getCell(c).alignment = { wrapText: true, horizontal: "center", vertical: "top" };
    }

    const gtRRow = ws.addRow([
      "",
      "Rem\nDev Rem",
      ...dates.map((d) => `${dailyTotals[d]?.remeras ?? 0}\n${dailyTotals[d]?.devRemeras ? `-${dailyTotals[d].devRemeras}` : "-"}`),
      `${grandTotals.remeras}\n${grandTotals.devRemeras ? `-${grandTotals.devRemeras}` : "-"}`,
    ]);
    xlTotal(gtRRow, 1, totalCols);
    for (let c = 2; c <= totalCols; c++) {
      gtRRow.getCell(c).alignment = { wrapText: true, horizontal: "center", vertical: "top" };
    }

    ws.mergeCells(gtBaseRow, 1, gtBaseRow + 1, 1);
    ws.getCell(gtBaseRow, 1).alignment = { vertical: "middle", horizontal: "center" };

    await downloadWorkbook(wb, getExcelFileName("prend-dev-vendedor"));
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-60 flex items-center justify-center">
      <div
        className={`relative flex flex-col rounded-lg shadow-2xl w-[95vw] h-[92vh] ${ts.tailwindcss.modal ?? "bg-[#252525] text-white"}`}
        style={{ border: "1px solid #3f3f46" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-5 bg-cyan-500 rounded-full" />
            <h2 className="text-sm font-semibold">Listado de Prendas/Dev Diario por Vendedor</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <MdClose className="text-xl" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-zinc-700 flex-shrink-0 items-end">
          <div>
            <div className="text-[11px] mb-1 opacity-50">Desde</div>
            <DatePicker
              value={dayjs(startDate)}
              format={dateFormat}
              onChange={(d) => d && setStartDate(d.format("YYYY-MM-DD"))}
              className={ts.classNameDatePicker}
              style={ts.datePicker}
              allowClear={false}
              popupClassName={ts.datePickerIndicator}
              getPopupContainer={() => document.body}
              popupStyle={{ zIndex: 10001 }}
            />
          </div>
          <div>
            <div className="text-[11px] mb-1 opacity-50">Hasta</div>
            <DatePicker
              value={dayjs(endDate)}
              format={dateFormat}
              onChange={(d) => d && setEndDate(d.format("YYYY-MM-DD"))}
              className={ts.classNameDatePicker}
              style={ts.datePicker}
              allowClear={false}
              popupClassName={ts.datePickerIndicator}
              getPopupContainer={() => document.body}
              popupStyle={{ zIndex: 10001 }}
            />
          </div>
          {isAdmin && (
            <div>
              <div className="text-[11px] mb-1 opacity-50">Sucursal</div>
              <Select
                value={store}
                className={`${ts.classNameSelector} w-[120px]`}
                dropdownStyle={{ ...ts.dropdownStylesCustom, zIndex: 10001 }}
                popupClassName={ts.classNameSelectorItem}
                onChange={(v) => { setStore(v); setEmployee("ALL"); }}
                getPopupContainer={() => document.body}
                options={listStore.map((s: any) => ({ label: s.name, value: s.value }))}
              />
            </div>
          )}
          <div>
            <div className="text-[11px] mb-1 opacity-50">Vendedor</div>
            <Select
              value={employee}
              className={`${ts.classNameSelector} w-[140px]`}
              dropdownStyle={{ ...ts.dropdownStylesCustom, zIndex: 10001 }}
              popupClassName={ts.classNameSelectorItem}
              onChange={(v) => setEmployee(v)}
              getPopupContainer={() => document.body}
              options={[
                { label: "Todos", value: "ALL" },
                ...filteredEmployees.map((e: any) => ({ label: e.name, value: e.name })),
              ]}
            />
          </div>
          <button
            className="bg-[#1BA1E2] hover:bg-[#1590cb] text-white px-4 py-1.5 rounded text-sm"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
          {data && (
            <button
              className="bg-[#4A5568] hover:bg-[#2D3748] text-white px-4 py-1.5 rounded text-sm"
              onClick={() => setShowGenerar(true)}
            >
              Generar
            </button>
          )}
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-auto px-4 py-3">
          {loading && (
            <div className="flex justify-center mt-10">
              <Spinner />
            </div>
          )}

          {!loading && !data && (
            <p className="text-center opacity-40 mt-10 text-sm">
              Seleccioná el rango de fechas y presioná Buscar
            </p>
          )}

          {!loading && data && (
            <>
              {sortedEmployees.length === 0 ? (
                <p className="text-center opacity-40 mt-10 text-sm">Sin datos para el período seleccionado</p>
              ) : (
                <table className="text-xs border-collapse" style={{ minWidth: `${160 + data.dates.length * 58}px` }}>
                  <thead>
                    <tr>
                      <th
                        className="border border-zinc-600 px-2 py-1.5 bg-[#1BA1E2] text-white text-left cursor-pointer hover:bg-[#1590cb] select-none"
                        style={{ minWidth: 110, position: "sticky", left: 0, zIndex: 2 }}
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center">Vendedor{getSortIcon("name")}</div>
                      </th>
                      <th
                        className="border border-zinc-600 px-1 py-1.5 bg-[#1BA1E2] text-white text-center"
                        style={{ width: 60, minWidth: 60 }}
                      >
                        Tipo
                      </th>
                      {data.dates.map((d) => (
                        <th
                          key={d}
                          className="border border-zinc-600 px-1 py-1 bg-[#1BA1E2] text-white text-center cursor-pointer hover:bg-[#1590cb] select-none"
                          style={{ minWidth: 56 }}
                          onClick={() => handleSort(d)}
                        >
                          <div className="text-[9px] opacity-80">{getDayName(d)}</div>
                          <div className="flex items-center justify-center text-xs">{d}{getSortIcon(d)}</div>
                        </th>
                      ))}
                      <th
                        className="border border-zinc-600 px-2 py-1.5 bg-[#0e6ba0] text-white text-center cursor-pointer hover:bg-[#0a5a8a] select-none"
                        style={{ minWidth: 56 }}
                        onClick={() => handleSort("total")}
                      >
                        <div className="flex items-center justify-center">Total{getSortIcon("total")}</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedEmployees.map((emp, idx) => {
                      const rowBg = idx % 2 === 0 ? "bg-zinc-800" : "bg-zinc-700";
                      return (
                        <>
                          {/* Fila Jeans / Dev Jeans */}
                          <tr key={`${emp.name}-j`} className={rowBg}>
                            <td
                              className={`border border-zinc-600 px-2 py-1 font-semibold ${rowBg}`}
                              style={{ position: "sticky", left: 0, zIndex: 1 }}
                              rowSpan={2}
                            >
                              <div className="text-xs">{emp.name}</div>
                              <div className="text-[10px] opacity-40">{emp.store}</div>
                            </td>
                            <td className="border border-zinc-600 px-1 py-0.5 text-center" style={{ width: 65 }}>
                              <div className="opacity-80">Jeans</div>
                              <div className="text-red-400 text-[10px]">Dev Jeans</div>
                            </td>
                            {data.dates.map((d) => (
                              <td key={d} className="border border-zinc-600 px-2 py-0.5 text-center">
                                <div>{emp.days[d]?.jeans || "-"}</div>
                                <div className="text-red-400 text-[10px]">
                                  {emp.days[d]?.devJeans ? `-${emp.days[d].devJeans}` : "-"}
                                </div>
                              </td>
                            ))}
                            <td className="border border-zinc-600 px-2 py-0.5 text-center font-bold bg-[#1e3a5f]">
                              <div>{emp.subtotals.jeans || "-"}</div>
                              <div className="text-red-400 text-[10px]">
                                {emp.subtotals.devJeans ? `-${emp.subtotals.devJeans}` : "-"}
                              </div>
                            </td>
                          </tr>

                          {/* Fila Rem / Dev Rem */}
                          <tr key={`${emp.name}-r`} className={rowBg}>
                            <td className="border border-zinc-600 px-1 py-0.5 text-center" style={{ width: 65 }}>
                              <div className="opacity-80">Rem</div>
                              <div className="text-red-400 text-[10px]">Dev Rem</div>
                            </td>
                            {data.dates.map((d) => (
                              <td key={d} className="border border-zinc-600 px-2 py-0.5 text-center">
                                <div>{emp.days[d]?.remeras || "-"}</div>
                                <div className="text-red-400 text-[10px]">
                                  {emp.days[d]?.devRemeras ? `-${emp.days[d].devRemeras}` : "-"}
                                </div>
                              </td>
                            ))}
                            <td className="border border-zinc-600 px-2 py-0.5 text-center font-bold bg-[#1e3a5f]">
                              <div>{emp.subtotals.remeras || "-"}</div>
                              <div className="text-red-400 text-[10px]">
                                {emp.subtotals.devRemeras ? `-${emp.subtotals.devRemeras}` : "-"}
                              </div>
                            </td>
                          </tr>
                        </>
                      );
                    })}

                    {/* Grand total — 2 filas */}
                    <tr className="font-bold">
                      <td className="border border-zinc-600 px-2 py-1 bg-[#1BA1E2] text-white text-center" style={{ position: "sticky", left: 0 }} rowSpan={2}>
                        TOTAL
                      </td>
                      <td className="border border-zinc-600 px-1 py-0.5 text-center bg-[#0e6ba0]" style={{ width: 65 }}>
                        <div className="text-white">Jeans</div>
                        <div className="text-red-300 text-[10px]">Dev Jeans</div>
                      </td>
                      {data.dates.map((d) => (
                        <td key={d} className="border border-zinc-600 px-2 py-0.5 text-center bg-[#1e3a5f]">
                          <div className="text-cyan-200">{data.dailyTotals[d]?.jeans || "-"}</div>
                          <div className="text-red-400 text-[10px]">{data.dailyTotals[d]?.devJeans || "-"}</div>
                        </td>
                      ))}
                      <td className="border border-zinc-600 px-2 py-0.5 text-center bg-[#164e63]">
                        <div className="text-white">{data.grandTotals.jeans}</div>
                        <div className="text-red-400 text-[10px]">{data.grandTotals.devJeans || "-"}</div>
                      </td>
                    </tr>
                    <tr className="font-bold">
                      <td className="border border-zinc-600 px-1 py-0.5 text-center bg-[#0e6ba0]" style={{ width: 65 }}>
                        <div className="text-white">Rem</div>
                        <div className="text-red-300 text-[10px]">Dev Rem</div>
                      </td>
                      {data.dates.map((d) => (
                        <td key={d} className="border border-zinc-600 px-2 py-0.5 text-center bg-[#1e3a5f]">
                          <div className="text-cyan-200">{data.dailyTotals[d]?.remeras || "-"}</div>
                          <div className="text-red-400 text-[10px]">{data.dailyTotals[d]?.devRemeras || "-"}</div>
                        </td>
                      ))}
                      <td className="border border-zinc-600 px-2 py-0.5 text-center bg-[#164e63]">
                        <div className="text-white">{data.grandTotals.remeras}</div>
                        <div className="text-red-400 text-[10px]">{data.grandTotals.devRemeras || "-"}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Generar */}
      {data && (
        <ModalGenerar
          isOpen={showGenerar}
          onClose={() => setShowGenerar(false)}
          title={REPORT_TITLE}
          pdfDocument={
            <PdfVendorDaily
              dates={data.dates}
              employees={sortedEmployees}
              dailyTotals={data.dailyTotals}
              grandTotals={data.grandTotals}
              storeName={storeName}
              timePeriod={timePeriod}
              year={dayjs(startDate).year()}
            />
          }
          pdfFileName={`prend-dev-vendedor-${storeName}-${dayjs(startDate).format("DD-MM-YY")}.pdf`}
          onExcel={handleExcel}
        />
      )}
    </div>
  );
};

export default VendorDailyContainer;
