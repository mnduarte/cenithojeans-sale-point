import { useEffect, useState } from "react";
import { saleActions, useSale } from "../../contexts/SaleContext";
import { useUser } from "../../contexts/UserContext";
import { cashflowActions, useCashflow } from "../../contexts/CashflowContext";
import { useTheme } from "../../contexts/ThemeContext";
import { formatCurrency, formatDateToYYYYMMDD } from "../../utils/formatUtils";
import { dateFormat, listStore, mappingListStore } from "../../utils/constants";
import { PDFDownloadLink } from "@react-pdf/renderer";
import dayjs from "dayjs";
import { DatePicker, Select, Tag } from "antd";

import { MdClose } from "react-icons/md";
import { FaPlus, FaSortUp, FaSortDown, FaSort } from "react-icons/fa";
import { GrPowerReset } from "react-icons/gr";
import Spinner from "../../components/Spinner";
import KeyboardNum from "../../components/KeyboardNum";
import Toast from "../../components/Toast";
import EditableTable from "../../components/EditableTable";
import NewRowSale from "./NewRowSale";
import NewNumOrder from "./NewNumOrder";

import TableSaleByDay from "./TableSaleByDay";
import Keyboard from "../../components/Keyboard";

import PdfLocalSale from "./PdfLocalSale";
import PdfLocalTransfer from "./PdfLocalTransfer";
import PdfLocalDevolutions from "./PdfLocalDevolutions";
import Api from "../../services/Api";
import { useAccountForTransfer } from "../../contexts/AccountForTransferContext";
import { useCashier } from "../../contexts/CashierContext";
import { getTextColorForBackground } from "../../utils/cashierColors";

const mappingConceptToUpdate: Record<string, string> = {
  cash: "Efectivo",
  transfer: "Transferencia",
  items: "Prendas",
  itemsJeans: "Prendas Jeans",
  itemsRemeras: "Prendas Remeras",
  total: "Total",
};

// ==================== MODAL DESGLOSE CASH ====================
const ModalCashBreakdown = ({ isOpen, setIsOpen, salesData }: any) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();

  const allCashSales = Object.values(salesData).flat() as any[];

  // Calcular Total Neto (incluyendo negativos)
  const totalNeto = allCashSales.reduce(
    (acc: number, sale: any) => acc + (sale.cash || 0),
    0,
  );

  // Calcular desglose (informativo)
  let brutoJeans = 0;
  let brutoRemeras = 0;
  let devolutionJeans = 0;
  let devolutionRemeras = 0;
  let surcharges = 0;
  let discounts = 0;
  let negativeCash = 0; // Para trackear valores negativos

  allCashSales.forEach((sale: any) => {
    const cashValue = sale.cash || 0;

    if (cashValue < 0) {
      // Acumular valores negativos
      negativeCash += cashValue;
    } else if (cashValue > 0) {
      // Ventas brutas
      const hasBreakdown =
        (sale.subTotalCashJeans || 0) + (sale.subTotalCashRemeras || 0) > 0;
      if (hasBreakdown) {
        brutoJeans += sale.subTotalCashJeans || 0;
        brutoRemeras += sale.subTotalCashRemeras || 0;
      } else {
        brutoJeans += sale.cash || 0;
      }

      // Devoluciones
      devolutionJeans += sale.subTotalDevolutionCashJeans || 0;
      devolutionRemeras += sale.subTotalDevolutionCashRemeras || 0;

      // Ajustes
      surcharges += sale.amountOfSurchargesCash || 0;
      discounts += sale.amountOfDiscountCash || 0;
    }
  });

  const totalBruto = brutoJeans + brutoRemeras;
  const totalDevolutions = devolutionJeans + devolutionRemeras;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-60 flex items-center justify-center">
      <div
        className={`w-[55vh] p-6 rounded-lg shadow-xl relative ${themeStyles[theme].tailwindcss.modal}`}
        style={{ border: "1px solid #3f3f46" }}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
          onClick={() => setIsOpen(false)}
        >
          <MdClose className="text-xl" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
          <h2 className="text-lg font-semibold text-gray-100">Desglose Cash</h2>
        </div>

        <div className="space-y-3">
          {/* Ventas por tipo */}
          <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/50">
            <label className="block text-xs text-gray-400 mb-2">
              Ventas (Bruto)
            </label>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-400">Jeans:</span>
                <span className="font-medium">
                  ${formatCurrency(brutoJeans)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-400">Remeras:</span>
                <span className="font-medium">
                  ${formatCurrency(brutoRemeras)}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-700 pt-2">
                <span className="text-gray-300">Subtotal Bruto:</span>
                <span className="font-bold">${formatCurrency(totalBruto)}</span>
              </div>
            </div>
          </div>

          {/* Recargos/Descuentos */}
          {(surcharges > 0 || discounts > 0) && (
            <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/50">
              <label className="block text-xs text-gray-400 mb-2">
                Ajustes
              </label>
              <div className="space-y-2">
                {surcharges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-yellow-400">+ Recargos:</span>
                    <span className="font-medium text-yellow-400">
                      +${formatCurrency(surcharges)}
                    </span>
                  </div>
                )}
                {discounts > 0 && (
                  <div className="flex justify-between">
                    <span className="text-orange-400">- Descuentos:</span>
                    <span className="font-medium text-orange-400">
                      -${formatCurrency(discounts)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Devoluciones */}
          {totalDevolutions > 0 && (
            <div className="p-3 rounded-lg bg-red-900/20 border border-red-800/30">
              <label className="block text-xs text-red-400 mb-2">
                Devoluciones
              </label>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-400">Jeans:</span>
                  <span className="font-medium text-red-400">
                    -${formatCurrency(devolutionJeans)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-400">Remeras:</span>
                  <span className="font-medium text-red-400">
                    -${formatCurrency(devolutionRemeras)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-red-800/30 pt-2">
                  <span className="text-red-300">Total Devoluciones:</span>
                  <span className="font-bold text-red-400">
                    -${formatCurrency(totalDevolutions)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Nota aclaratoria */}
          <div className="text-xs text-gray-500 italic px-1">
            * Los subtotales brutos pueden diferir del neto por descuentos,
            recargos y pagos mixtos.
          </div>

          {/* Valores Negativos (ej: correcciones manuales) */}
          {negativeCash < 0 && (
            <div className="p-3 rounded-lg bg-purple-900/20 border border-purple-800/30">
              <label className="block text-xs text-purple-400 mb-2">
                Ajustes Negativos
              </label>
              <div className="flex justify-between">
                <span className="text-purple-300">Correcciones/Otros:</span>
                <span className="font-bold text-purple-400">
                  ${formatCurrency(negativeCash)}
                </span>
              </div>
            </div>
          )}

          {/* Total Neto */}
          <div className="p-3 rounded-lg bg-blue-900/30 border border-blue-700/50">
            <div className="flex justify-between text-lg">
              <span className="text-white font-bold">Total Neto Cash:</span>
              <span className="text-blue-400 font-bold">
                ${formatCurrency(totalNeto)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MODAL DESGLOSE TRANSFER ====================
const ModalTransferBreakdown = ({
  isOpen,
  setIsOpen,
  salesTransferData,
}: any) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();

  const allTransferSales = salesTransferData as any[];

  // Calcular Total Neto (incluyendo negativos)
  const totalNeto = allTransferSales.reduce(
    (acc: number, sale: any) => acc + (sale.transfer || 0),
    0,
  );

  // Calcular desglose (informativo)
  let brutoJeans = 0;
  let brutoRemeras = 0;
  let devolutionJeans = 0;
  let devolutionRemeras = 0;
  let surcharges = 0;
  let discounts = 0;
  let negativeTransfer = 0;

  allTransferSales.forEach((sale: any) => {
    const transferValue = sale.transfer || 0;

    if (transferValue < 0) {
      // Acumular valores negativos
      negativeTransfer += transferValue;
    } else if (transferValue > 0) {
      // Ventas brutas
      const hasBreakdown =
        (sale.subTotalTransferJeans || 0) +
          (sale.subTotalTransferRemeras || 0) >
        0;
      if (hasBreakdown) {
        brutoJeans += sale.subTotalTransferJeans || 0;
        brutoRemeras += sale.subTotalTransferRemeras || 0;
      } else {
        brutoJeans += sale.transfer || 0;
      }

      // Devoluciones
      devolutionJeans += sale.subTotalDevolutionTransferJeans || 0;
      devolutionRemeras += sale.subTotalDevolutionTransferRemeras || 0;

      // Ajustes
      surcharges += sale.amountOfSurchargesTransfer || 0;
      discounts += sale.amountOfDiscountTransfer || 0;
    }
  });

  const totalBruto = brutoJeans + brutoRemeras;
  const totalDevolutions = devolutionJeans + devolutionRemeras;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-60 flex items-center justify-center">
      <div
        className={`w-[55vh] p-6 rounded-lg shadow-xl relative ${themeStyles[theme].tailwindcss.modal}`}
        style={{ border: "1px solid #3f3f46" }}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
          onClick={() => setIsOpen(false)}
        >
          <MdClose className="text-xl" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-6 bg-cyan-500 rounded-full"></div>
          <h2 className="text-lg font-semibold text-gray-100">
            Desglose Transferencia
          </h2>
        </div>

        <div className="space-y-3">
          {/* Ventas por tipo */}
          <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/50">
            <label className="block text-xs text-gray-400 mb-2">
              Ventas (Bruto)
            </label>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-400">Jeans:</span>
                <span className="font-medium">
                  ${formatCurrency(brutoJeans)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-400">Remeras:</span>
                <span className="font-medium">
                  ${formatCurrency(brutoRemeras)}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-700 pt-2">
                <span className="text-gray-300">Subtotal Bruto:</span>
                <span className="font-bold">${formatCurrency(totalBruto)}</span>
              </div>
            </div>
          </div>

          {/* Recargos/Descuentos */}
          {(surcharges > 0 || discounts > 0) && (
            <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/50">
              <label className="block text-xs text-gray-400 mb-2">
                Ajustes
              </label>
              <div className="space-y-2">
                {surcharges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-yellow-400">+ Recargos:</span>
                    <span className="font-medium text-yellow-400">
                      +${formatCurrency(surcharges)}
                    </span>
                  </div>
                )}
                {discounts > 0 && (
                  <div className="flex justify-between">
                    <span className="text-orange-400">- Descuentos:</span>
                    <span className="font-medium text-orange-400">
                      -${formatCurrency(discounts)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Devoluciones */}
          {totalDevolutions > 0 && (
            <div className="p-3 rounded-lg bg-red-900/20 border border-red-800/30">
              <label className="block text-xs text-red-400 mb-2">
                Devoluciones
              </label>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-400">Jeans:</span>
                  <span className="font-medium text-red-400">
                    -${formatCurrency(devolutionJeans)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-400">Remeras:</span>
                  <span className="font-medium text-red-400">
                    -${formatCurrency(devolutionRemeras)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-red-800/30 pt-2">
                  <span className="text-red-300">Total Devoluciones:</span>
                  <span className="font-bold text-red-400">
                    -${formatCurrency(totalDevolutions)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Valores Negativos (ej: correcciones manuales) */}
          {negativeTransfer < 0 && (
            <div className="p-3 rounded-lg bg-purple-900/20 border border-purple-800/30">
              <label className="block text-xs text-purple-400 mb-2">
                Ajustes Negativos
              </label>
              <div className="flex justify-between">
                <span className="text-purple-300">Correcciones/Otros:</span>
                <span className="font-bold text-purple-400">
                  ${formatCurrency(negativeTransfer)}
                </span>
              </div>
            </div>
          )}

          {/* Nota aclaratoria */}
          <div className="text-xs text-gray-500 italic px-1">
            * Los subtotales brutos pueden diferir del neto por descuentos,
            recargos y pagos mixtos.
          </div>

          {/* Total Neto */}
          <div className="p-3 rounded-lg bg-cyan-900/30 border border-cyan-700/50">
            <div className="flex justify-between text-lg">
              <span className="text-white font-bold">Total Neto Transfer:</span>
              <span className="text-cyan-400 font-bold">
                ${formatCurrency(totalNeto)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MODAL DESGLOSE PRENDAS ====================
const ModalItemsBreakdown = ({ isOpen, setIsOpen, salesData }: any) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();

  const allSales = Object.values(salesData).flat() as any[];

  const totals = allSales.reduce(
    (acc: any, sale: any) => {
      // Normalizar: si no hay desglose J/R, asignar items a jeans
      const hasBreakdown =
        (sale.itemsJeans || 0) + (sale.itemsRemeras || 0) > 0;
      const jeans = hasBreakdown ? sale.itemsJeans || 0 : sale.items || 0;
      const remeras = hasBreakdown ? sale.itemsRemeras || 0 : 0;

      // Lo mismo para devoluciones
      const hasDevBreakdown =
        (sale.itemsDevolutionJeans || 0) + (sale.itemsDevolutionRemeras || 0) >
        0;
      const devJeans = hasDevBreakdown
        ? sale.itemsDevolutionJeans || 0
        : sale.devolutionItems || 0;
      const devRemeras = hasDevBreakdown ? sale.itemsDevolutionRemeras || 0 : 0;

      return {
        itemsJeans: acc.itemsJeans + jeans,
        itemsRemeras: acc.itemsRemeras + remeras,
        devolutionJeans: acc.devolutionJeans + devJeans,
        devolutionRemeras: acc.devolutionRemeras + devRemeras,
      };
    },
    {
      itemsJeans: 0,
      itemsRemeras: 0,
      devolutionJeans: 0,
      devolutionRemeras: 0,
    },
  );

  const totalVentas = totals.itemsJeans + totals.itemsRemeras;
  const totalDevoluciones = totals.devolutionJeans + totals.devolutionRemeras;
  const totalNeto = totalVentas - totalDevoluciones;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-60 flex items-center justify-center">
      <div
        className={`w-[55vh] p-6 rounded-lg shadow-xl relative ${themeStyles[theme].tailwindcss.modal}`}
        style={{ border: "1px solid #3f3f46" }}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
          onClick={() => setIsOpen(false)}
        >
          <MdClose className="text-xl" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-6 bg-lime-500 rounded-full"></div>
          <h2 className="text-lg font-semibold text-gray-100">
            Desglose Prendas
          </h2>
        </div>

        <div className="space-y-3">
          {/* Ventas por tipo */}
          <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/50">
            <label className="block text-xs text-gray-400 mb-2">
              Prendas Vendidas
            </label>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-400">Jeans:</span>
                <span className="font-medium text-lg">{totals.itemsJeans}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-400">Remeras:</span>
                <span className="font-medium text-lg">
                  {totals.itemsRemeras}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-700 pt-2">
                <span className="text-gray-300">Total Vendidas:</span>
                <span className="font-bold text-lg">{totalVentas}</span>
              </div>
            </div>
          </div>

          {/* Devoluciones */}
          <div className="p-3 rounded-lg bg-red-900/20 border border-red-800/30">
            <label className="block text-xs text-red-400 mb-2">
              Devoluciones
            </label>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-400">Jeans:</span>
                <span className="font-medium text-red-400 text-lg">
                  -{totals.devolutionJeans}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-400">Remeras:</span>
                <span className="font-medium text-red-400 text-lg">
                  -{totals.devolutionRemeras}
                </span>
              </div>
              <div className="flex justify-between border-t border-red-800/30 pt-2">
                <span className="text-red-300">Total Devoluciones:</span>
                <span className="font-bold text-red-400 text-lg">
                  -{totalDevoluciones}
                </span>
              </div>
            </div>
          </div>

          {/* Total Neto */}
          <div className="p-3 rounded-lg bg-lime-900/30 border border-lime-700/50">
            <div className="flex justify-between text-lg">
              <span className="text-white font-bold">Total Neto Prendas:</span>
              <span className="text-lime-400 font-bold text-xl">
                {totalNeto}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MODAL LISTADO DEVOLUCIONES ====================
const ModalListDevolutions = ({ isOpen, setIsOpen, date, store }: any) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();

  const [salesWithDevolutions, setSalesWithDevolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState("Consolidado");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc" | null;
  }>({ key: "", direction: null });

  // Obtener lista única de vendedores
  const vendedores = [
    ...new Set(
      salesWithDevolutions.map((s: any) => s.employee).filter(Boolean),
    ),
  ];

  useEffect(() => {
    if (isOpen && date) {
      fetchDevolutions();
    }
  }, [isOpen, date, store]);

  const fetchDevolutions = async () => {
    setLoading(true);
    try {
      const { data } = await Api.getSalesWithDevolutions({ date, store });
      setSalesWithDevolutions(data.results || []);
    } catch (error) {
      console.log("Error fetching devolutions:", error);
      setSalesWithDevolutions([]);
    }
    setLoading(false);
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
    if (sortConfig.key !== key)
      return <FaSort className="ml-1 text-gray-400 text-xs" />;
    if (sortConfig.direction === "asc")
      return <FaSortUp className="ml-1 text-red-400 text-xs" />;
    return <FaSortDown className="ml-1 text-red-400 text-xs" />;
  };

  // Filtrar y ordenar datos
  const getFilteredData = () => {
    let data = [...salesWithDevolutions];

    // Si no es consolidado, filtrar por vendedor específico
    if (filterMode !== "Consolidado") {
      data = data.filter((sale: any) => sale.employee === filterMode);
    }

    // Aplicar sorting
    if (sortConfig.key && sortConfig.direction) {
      data.sort((a: any, b: any) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }

        aValue = String(aValue || "").toLowerCase();
        bValue = String(bValue || "").toLowerCase();
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  };

  // Obtener datos consolidados por vendedor
  const getConsolidatedData = () => {
    const grouped = salesWithDevolutions.reduce((acc: any, sale: any) => {
      const emp = sale.employee || "Sin vendedor";
      if (!acc[emp]) {
        acc[emp] = {
          employee: emp,
          items: 0,
          devolutionItems: 0,
          itemsDevolutionJeans: 0,
          itemsDevolutionRemeras: 0,
          montoDevolucionJeans: 0,
          montoDevolucionRemeras: 0,
          subTotalDevolutionItems: 0,
          ventasCount: 0,
        };
      }
      acc[emp].items += sale.items || 0;
      acc[emp].devolutionItems += sale.devolutionItems || 0;
      acc[emp].itemsDevolutionJeans += sale.itemsDevolutionJeans || 0;
      acc[emp].itemsDevolutionRemeras += sale.itemsDevolutionRemeras || 0;
      acc[emp].montoDevolucionJeans += sale.montoDevolucionJeans || 0;
      acc[emp].montoDevolucionRemeras += sale.montoDevolucionRemeras || 0;
      acc[emp].subTotalDevolutionItems += sale.subTotalDevolutionItems || 0;
      acc[emp].ventasCount += 1;
      return acc;
    }, {});

    let data = Object.values(grouped);

    // Aplicar sorting a datos consolidados
    if (sortConfig.key && sortConfig.direction) {
      data.sort((a: any, b: any) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }

        aValue = String(aValue || "").toLowerCase();
        bValue = String(bValue || "").toLowerCase();
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data as any[];
  };

  const filteredData =
    filterMode === "Consolidado" ? getConsolidatedData() : getFilteredData();

  // Calcular totales
  const totals = filteredData.reduce(
    (acc: any, item: any) => ({
      items: acc.items + (item.items || 0),
      devolutionItems: acc.devolutionItems + (item.devolutionItems || 0),
      itemsDevolutionJeans:
        acc.itemsDevolutionJeans + (item.itemsDevolutionJeans || 0),
      itemsDevolutionRemeras:
        acc.itemsDevolutionRemeras + (item.itemsDevolutionRemeras || 0),
      montoDevolucionJeans:
        acc.montoDevolucionJeans + (item.montoDevolucionJeans || 0),
      montoDevolucionRemeras:
        acc.montoDevolucionRemeras + (item.montoDevolucionRemeras || 0),
      subTotalDevolutionItems:
        acc.subTotalDevolutionItems + (item.subTotalDevolutionItems || 0),
    }),
    {
      items: 0,
      devolutionItems: 0,
      itemsDevolutionJeans: 0,
      itemsDevolutionRemeras: 0,
      montoDevolucionJeans: 0,
      montoDevolucionRemeras: 0,
      subTotalDevolutionItems: 0,
    },
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-60 flex items-center justify-center">
      <div
        className={`w-[95vh] h-[75vh] p-6 rounded-lg shadow-xl relative ${themeStyles[theme].tailwindcss.modal}`}
        style={{ border: "1px solid #dc2626" }}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
          onClick={() => setIsOpen(false)}
        >
          <MdClose className="text-xl" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-6 bg-red-500 rounded-full"></div>
          <h2 className="text-lg font-semibold text-gray-100">
            Listado de Devoluciones - {date}
          </h2>
        </div>

        {/* Filtros y acciones */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300">Vista:</label>
            <Select
              className={themeStyles[theme].classNameSelector}
              dropdownStyle={themeStyles[theme].dropdownStylesCustom}
              popupClassName={themeStyles[theme].classNameSelectorItem}
              style={{ width: 180 }}
              value={filterMode}
              onChange={(value: any) => {
                setFilterMode(value);
                setSortConfig({ key: "", direction: null });
              }}
              getPopupContainer={(trigger) =>
                trigger.parentElement || document.body
              }
            >
              <Select.Option value="Consolidado">📊 Consolidado</Select.Option>
              {vendedores.map((v: any) => (
                <Select.Option key={v} value={v}>
                  👤 {v}
                </Select.Option>
              ))}
            </Select>
          </div>

          <PDFDownloadLink
            document={
              <PdfLocalDevolutions
                date={dayjs(date).format("DD-MM-YYYY")}
                store={mappingListStore[store]}
                data={
                  filterMode === "Consolidado"
                    ? salesWithDevolutions
                    : filteredData
                }
                isConsolidated={filterMode === "Consolidado"}
                selectedEmployee={
                  filterMode !== "Consolidado" ? filterMode : undefined
                }
              />
            }
            fileName={`listado-devoluciones-${dayjs(date).format(
              "DD-MM-YYYY",
            )}.pdf`}
            className="bg-red-700 hover:bg-red-800 text-white px-4 py-1 rounded-md flex items-center justify-center select-none cursor-pointer"
          >
            {({ loading: pdfLoading }) =>
              pdfLoading ? "Cargando..." : "Generar PDF"
            }
          </PDFDownloadLink>
        </div>

        {/* Tabla */}
        <div className="h-[52vh] overflow-y-auto overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner />
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              No hay devoluciones para mostrar
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-800">
                <tr>
                  {filterMode !== "Consolidado" && (
                    <th
                      className="p-2 text-left cursor-pointer hover:bg-gray-700 text-blue-400"
                      onClick={() => handleSort("order")}
                    >
                      <div className="flex items-center">
                        N° {getSortIcon("order")}
                      </div>
                    </th>
                  )}
                  <th
                    className="p-2 text-left cursor-pointer hover:bg-gray-700 text-blue-400"
                    onClick={() => handleSort("employee")}
                  >
                    <div className="flex items-center">
                      Vendedor {getSortIcon("employee")}
                    </div>
                  </th>
                  <th
                    className="p-2 text-center cursor-pointer hover:bg-gray-700 text-blue-400"
                    onClick={() => handleSort("items")}
                  >
                    <div className="flex items-center justify-center">
                      Prendas {getSortIcon("items")}
                    </div>
                  </th>
                  <th
                    className="p-2 text-center cursor-pointer hover:bg-gray-700 text-red-400"
                    onClick={() => handleSort("devolutionItems")}
                  >
                    <div className="flex items-center justify-center">
                      Devueltas {getSortIcon("devolutionItems")}
                    </div>
                  </th>
                  <th
                    className="p-2 text-center cursor-pointer hover:bg-gray-700 text-red-400"
                    onClick={() => handleSort("itemsDevolutionJeans")}
                  >
                    <div className="flex items-center justify-center">
                      Dev. J {getSortIcon("itemsDevolutionJeans")}
                    </div>
                  </th>
                  <th
                    className="p-2 text-center cursor-pointer hover:bg-gray-700 text-red-400"
                    onClick={() => handleSort("itemsDevolutionRemeras")}
                  >
                    <div className="flex items-center justify-center">
                      Dev. R {getSortIcon("itemsDevolutionRemeras")}
                    </div>
                  </th>
                  <th
                    className="p-2 text-center cursor-pointer hover:bg-gray-700 text-red-400"
                    onClick={() => handleSort("montoDevolucionJeans")}
                  >
                    <div className="flex items-center justify-center">
                      Monto J {getSortIcon("montoDevolucionJeans")}
                    </div>
                  </th>
                  <th
                    className="p-2 text-center cursor-pointer hover:bg-gray-700 text-red-400"
                    onClick={() => handleSort("montoDevolucionRemeras")}
                  >
                    <div className="flex items-center justify-center">
                      Monto R {getSortIcon("montoDevolucionRemeras")}
                    </div>
                  </th>
                  <th
                    className="p-2 text-center cursor-pointer hover:bg-gray-700 text-red-400"
                    onClick={() => handleSort("subTotalDevolutionItems")}
                  >
                    <div className="flex items-center justify-center">
                      Monto Total {getSortIcon("subTotalDevolutionItems")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item: any, index: number) => (
                  <tr
                    key={index}
                    className="border-b border-gray-700 hover:bg-gray-700/50"
                  >
                    {filterMode !== "Consolidado" && (
                      <td className="p-2 text-blue-400">{item.order || "-"}</td>
                    )}
                    <td className="p-2 text-blue-400">
                      {item.employee || "-"}
                    </td>
                    <td className="p-2 text-center text-blue-400">
                      {item.items || 0}
                    </td>
                    <td className="p-2 text-center text-red-400 font-bold">
                      {item.devolutionItems || 0}
                    </td>
                    <td className="p-2 text-center text-red-400">
                      {item.itemsDevolutionJeans || 0}
                    </td>
                    <td className="p-2 text-center text-red-400">
                      {item.itemsDevolutionRemeras || 0}
                    </td>
                    <td className="p-2 text-center text-red-400">
                      ${formatCurrency(item.montoDevolucionJeans || 0)}
                    </td>
                    <td className="p-2 text-center text-red-400">
                      ${formatCurrency(item.montoDevolucionRemeras || 0)}
                    </td>
                    <td className="p-2 text-center text-red-400 font-bold">
                      ${formatCurrency(item.subTotalDevolutionItems || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Footer con totales */}
              <tfoot className="sticky bottom-0 bg-gray-800 font-bold border-t-2 border-red-500">
                <tr>
                  {filterMode !== "Consolidado" && <td className="p-2"></td>}
                  <td className="p-2 text-blue-400">TOTALES</td>
                  <td className="p-2 text-center text-blue-400">
                    {totals.items}
                  </td>
                  <td className="p-2 text-center text-red-400">
                    {totals.devolutionItems}
                  </td>
                  <td className="p-2 text-center text-red-400">
                    {totals.itemsDevolutionJeans}
                  </td>
                  <td className="p-2 text-center text-red-400">
                    {totals.itemsDevolutionRemeras}
                  </td>
                  <td className="p-2 text-center text-red-400">
                    ${formatCurrency(totals.montoDevolucionJeans)}
                  </td>
                  <td className="p-2 text-center text-red-400">
                    ${formatCurrency(totals.montoDevolucionRemeras)}
                  </td>
                  <td className="p-2 text-center text-red-400">
                    ${formatCurrency(totals.subTotalDevolutionItems)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const ModalListOutgoing = ({
  isModalListOutgoingOpen,
  setIsModalListOutgoingOpen,
  date,
  outgoings = [],
}: any) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();
  const { cashiers } = useCashier();
  const [itemsIdSelected, setItemsIdSelected] = useState<any[]>([]);
  const [editableRow, setEditableRow] = useState<number | null>(null);
  const [isModalKeyboardNumOpen, setIsModalKeyboardNumOpen] = useState(false);
  const [value, setValue] = useState(0);
  const [propSale, setPropSale] = useState({
    id: "",
    dataIndex: "",
  });

  const {
    state: { loading },
    dispatch: dispatchCashflow,
  } = useCashflow();

  const columns = [
    {
      title: "Detalle",
      dataIndex: "description",
      type: "string",
    },
    {
      title: "Importe",
      dataIndex: "amount",
      editableCell: true,
      type: "string",
      format: (number: any) => `$${formatCurrency(number)}`,
      applyFormat: true,
      sumAcc: true,
    },
  ];

  const handleManualValue = (item: any) => {
    if (item.action === "deleteLast") {
      return setValue((currentValue: any) =>
        Number(String(currentValue).slice(0, -1)),
      );
    }

    if (item.action === "addPrice") {
      dispatchCashflow(
        cashflowActions.updateCashflow({ ...propSale, value })(
          dispatchCashflow,
        ),
      );
      setValue(0);
      setEditableRow(null);
      return setIsModalKeyboardNumOpen(false);
    }

    setValue((currentValue: any) =>
      Number(String(currentValue) + String(item.value)),
    );
  };

  const handleAction = ({ dataIndex, value, id, inputType }: any) => {
    if (inputType === "string") {
      setPropSale({ dataIndex, id });
      setValue(value ? value : 0);
      setIsModalKeyboardNumOpen(true);
    }
  };

  // Función para obtener color del cajero
  const getCashierColor = (cashierId: any) => {
    if (!cashierId) return null;
    const cashier = cashiers.find(
      (c: any) => c.id === cashierId || c._id === cashierId,
    );
    return cashier?.color || null;
  };

  return (
    <>
      {isModalListOutgoingOpen && (
        <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center">
          <div
            className={`w-[70vh] rounded-lg shadow-xl relative ${themeStyles[theme].tailwindcss.modal}`}
            style={{ border: "1px solid #3f3f46" }}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-rose-500 rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-100">
                  Listado de Egresos - {date}
                </h2>
              </div>
              <button
                className="text-gray-400 hover:text-gray-200 p-1 rounded transition-colors"
                onClick={() => setIsModalListOutgoingOpen(false)}
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            {/* Actions */}
            {Boolean(itemsIdSelected.length) && (
              <div className="px-6 py-3 border-b border-gray-700">
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
                  onClick={() => {
                    setItemsIdSelected([]);
                    dispatchCashflow(
                      cashflowActions.removeCashflows({
                        cashflowIds: itemsIdSelected,
                      })(dispatchCashflow),
                    );
                  }}
                >
                  Eliminar Items Seleccionados
                </button>
              </div>
            )}

            {/* Table */}
            <div className="p-6 max-h-[50vh] overflow-y-auto">
              <EditableTable
                data={outgoings}
                columns={columns}
                handleAction={handleAction}
                editableRow={editableRow}
                handleEditClick={(rowIndex: number) => {
                  setEditableRow(rowIndex);
                }}
                itemsIdSelected={itemsIdSelected}
                setItemsIdSelected={setItemsIdSelected}
                enableSelectItem={true}
                getRowStyle={(row: any) => {
                  const color = getCashierColor(row.cashierId);
                  if (color) {
                    return {
                      backgroundColor: color + "40",
                      borderLeft: `3px solid ${color}`,
                    };
                  }
                  return {};
                }}
              />

              <KeyboardNum
                isModalKeyboardNumOpen={isModalKeyboardNumOpen}
                manualNum={value}
                handleManualNum={handleManualValue}
                closeModal={() => {
                  setValue(0);
                  setEditableRow(null);
                  setIsModalKeyboardNumOpen(false);
                }}
                title={"Ingrese " + mappingConceptToUpdate[propSale.dataIndex]}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Función para formatear hora (ajustada a timezone local Argentina UTC-3)
const formatTime = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  // Ajustar a Argentina (UTC-3) - la fecha viene en UTC desde MongoDB
  const argentinaOffset = -3 * 60; // -3 horas en minutos
  const localOffset = date.getTimezoneOffset(); // offset local en minutos
  const argentinaTime = new Date(date.getTime() + argentinaOffset * -1 * 60000);

  return argentinaTime.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const ModalListTranferSale = ({
  isModalListTransferSaleOpen,
  setIsModalListTransferSaleOpen,
  date,
  store,
  sales = [],
}: any) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();
  const {
    state: { user },
  } = useUser();
  const {
    state: { accountsForTransfer },
  } = useAccountForTransfer();

  const [itemsIdSelected, setItemsIdSelected] = useState<any[]>([]);
  const [cashflowIdSelected, setCashflowIdSelected] = useState<any[]>([]);
  const [editableRowId, setEditableRowId] = useState<string | null>(null);
  const [isModalKeyboardNumOpen, setIsModalKeyboardNumOpen] = useState(false);
  const [value, setValue] = useState(0);
  const [propSale, setPropSale] = useState({
    id: "",
    dataIndex: "",
  });

  const [salesFiltered, setSalesFiltered] = useState(sales);
  const [filterVendedor, setFilterVendedor] = useState("Todos");
  const [filterCuenta, setFilterCuenta] = useState("Todos");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc" | null;
  }>({ key: "", direction: null });

  const { dispatch: dispatchSale } = useSale();

  // Obtener lista única de vendedores
  const vendedores = [
    ...new Set(sales.map((s: any) => s.employee).filter(Boolean)),
  ];

  useEffect(() => {
    let filtered = [...sales];

    // Filtrar por vendedor
    if (filterVendedor !== "Todos") {
      filtered = filtered.filter(
        (sale: any) => sale.employee === filterVendedor,
      );
    }

    // Filtrar por cuenta
    if (filterCuenta !== "Todos") {
      filtered = filtered.filter(
        (sale: any) => sale.accountForTransfer === filterCuenta,
      );
    }

    // Aplicar sorting
    if (sortConfig.key && sortConfig.direction) {
      filtered.sort((a: any, b: any) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }

        if (sortConfig.key === "createdAt") {
          const dateA = new Date(aValue || 0).getTime();
          const dateB = new Date(bValue || 0).getTime();
          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
        }

        aValue = String(aValue || "").toLowerCase();
        bValue = String(bValue || "").toLowerCase();
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    setSalesFiltered(filtered);
  }, [sales, filterVendedor, filterCuenta, sortConfig]);

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
    if (sortConfig.key !== key)
      return <FaSort className="ml-1 text-gray-400 text-xs" />;
    if (sortConfig.direction === "asc")
      return <FaSortUp className="ml-1 text-cyan-400 text-xs" />;
    return <FaSortDown className="ml-1 text-cyan-400 text-xs" />;
  };

  // Manejar edición con KeyboardNum
  const handleManualValue = (item: any) => {
    if (item.action === "deleteLast") {
      return setValue((currentValue: any) =>
        Number(String(currentValue).slice(0, -1)),
      );
    }

    if (item.action === "addPrice") {
      dispatchSale(
        saleActions.updateSaleByEmployee({ ...propSale, value })(dispatchSale),
      );
      setValue(0);
      setEditableRowId(null); // Reset fila al estado normal
      return setIsModalKeyboardNumOpen(false);
    }

    setValue((currentValue: any) =>
      Number(String(currentValue) + String(item.value)),
    );
  };

  // Click en fila para seleccionarla (paso 1)
  const handleRowClick = (sale: any) => {
    if (sale.type === "ingreso") return;
    setEditableRowId(editableRowId === sale.id ? null : sale.id);
  };

  // Click en input para abrir KeyboardNum (paso 2)
  const handleInputClick = (e: React.MouseEvent, sale: any, dataIndex: string, currentValue: any) => {
    e.stopPropagation();
    setPropSale({ id: sale.id, dataIndex });
    setValue(currentValue || 0);
    setIsModalKeyboardNumOpen(true);
  };

  // Manejar cambio en select de cuenta
  const handleAccountChange = (sale: any, newValue: string) => {
    dispatchSale(
      saleActions.updateSaleByEmployee({
        id: sale.id,
        dataIndex: "accountForTransfer",
        value: newValue,
      })(dispatchSale),
    );
  };

  // Calcular totales
  const totals = salesFiltered.reduce(
    (acc: any, sale: any) => ({
      cash: acc.cash + (sale.cash || 0),
      transfer: acc.transfer + (sale.transfer || 0),
      itemsJeans: acc.itemsJeans + (sale.itemsJeans || 0),
      itemsRemeras: acc.itemsRemeras + (sale.itemsRemeras || 0),
      items: acc.items + (sale.items || 0),
      total: acc.total + (sale.total || 0),
    }),
    { cash: 0, transfer: 0, itemsJeans: 0, itemsRemeras: 0, items: 0, total: 0 },
  );

  // Calcular consolidado (siempre, no depende del filtro)
  const consolidado = salesFiltered.reduce(
    (acc: any, sale: any) => {
      const cuenta = sale.accountForTransfer || "Sin cuenta";
      if (!acc[cuenta]) {
        acc[cuenta] = {
          cuenta,
          efectivo: 0,
          transferencia: 0,
          prendasJeans: 0,
          prendasRemeras: 0,
          prendas: 0,
          total: 0,
        };
      }
      acc[cuenta].efectivo += sale.cash || 0;
      acc[cuenta].transferencia += sale.transfer || 0;
      acc[cuenta].prendasJeans += sale.itemsJeans || 0;
      acc[cuenta].prendasRemeras += sale.itemsRemeras || 0;
      acc[cuenta].prendas += sale.items || 0;
      acc[cuenta].total += sale.total || 0;
      return acc;
    },
    {},
  );

  // Definición de columnas con anchos ajustados
  type Column = {
    key: string;
    title: string;
    sortable: boolean;
    editable: boolean | string;
    width: string;
    format?: (value: any) => string;
    color?: string;
  };

  const columns: Column[] = [
    { key: "order", title: "N°", sortable: true, editable: false, width: "w-10" },
    { key: "employee", title: "Vendedor", sortable: true, editable: false, width: "w-20" },
    { key: "createdAt", title: "Hora", sortable: true, editable: false, width: "w-14", format: formatTime },
    { key: "cash", title: "Efectivo", sortable: true, editable: true, width: "w-24", format: (v: any) => `$${formatCurrency(v)}` },
    { key: "transfer", title: "Transfer", sortable: true, editable: true, width: "w-24", format: (v: any) => `$${formatCurrency(v)}` },
    { key: "itemsJeans", title: "P.J", sortable: true, editable: true, width: "w-12", color: "#3b82f6" },
    { key: "itemsRemeras", title: "P.R", sortable: true, editable: true, width: "w-12", color: "#22c55e" },
    { key: "items", title: "Prend", sortable: true, editable: false, width: "w-12" },
    { key: "accountForTransfer", title: "Cuenta", sortable: true, editable: "select", width: "w-28" },
    { key: "total", title: "Total", sortable: true, editable: true, width: "w-24", format: (v: any) => `$${formatCurrency(v)}` },
  ];

  return (
    <>
      {isModalListTransferSaleOpen && (
        <div className="fixed inset-0 z-[1050] bg-[#252525] bg-opacity-60 flex items-center justify-center">
          <div
            className={`w-[115vh] h-[85vh] p-8 rounded-md shadow-md relative ${themeStyles[theme].tailwindcss.modal}`}
          >
            <button
              className="absolute top-4 right-4"
              onClick={() => setIsModalListTransferSaleOpen(false)}
            >
              <MdClose className="text-2xl" />
            </button>

            <h2 className="text-lg font-bold mb-4">
              Listado de Transferencias - {date}
            </h2>

            {/* Filtros */}
            <div className="mt-2 h-[6vh] mx-auto max-w flex items-center flex-wrap gap-2">
              <div className="inline-block">
                <label className="mr-2 text-sm">Vendedor:</label>
                <Select
                  className={themeStyles[theme].classNameSelector}
                  dropdownStyle={themeStyles[theme].dropdownStylesCustom}
                  popupClassName={themeStyles[theme].classNameSelectorItem}
                  style={{ width: 130 }}
                  value={filterVendedor}
                  onSelect={(value: any) => setFilterVendedor(value)}
                  options={[
                    { label: "Todos", value: "Todos" },
                    ...vendedores.map((v: any) => ({ value: v, label: v })),
                  ]}
                />
              </div>

              <div className="inline-block">
                <label className="mr-2 text-sm">Cuenta:</label>
                <Select
                  className={themeStyles[theme].classNameSelector}
                  dropdownStyle={themeStyles[theme].dropdownStylesCustom}
                  popupClassName={themeStyles[theme].classNameSelectorItem}
                  style={{ width: 130 }}
                  value={filterCuenta}
                  onSelect={(value: any) => setFilterCuenta(value)}
                  options={[
                    { label: "Todos", value: "Todos" },
                    ...accountsForTransfer.map((data: any) => ({
                      value: data.name,
                      label: data.name,
                    })),
                  ]}
                />
              </div>

              <PDFDownloadLink
                document={
                  <PdfLocalTransfer
                    date={dayjs(date).format("DD-MM-YYYY")}
                    store={mappingListStore[store]}
                    data={salesFiltered}
                    showConsolidado={true}
                  />
                }
                fileName={`listado-transferencias-${dayjs(date).format("DD-MM-YYYY")}.pdf`}
                className="w-25 ml-2 bg-cyan-700 hover:bg-cyan-800 hover:cursor-pointer text-white px-4 py-1 rounded-md flex items-center justify-center select-none"
              >
                {({ loading }) =>
                  loading ? <button>Cargando...</button> : <button>Generar PDF</button>
                }
              </PDFDownloadLink>

              {(Boolean(itemsIdSelected.length) || Boolean(cashflowIdSelected.length)) && (
                <div
                  className="ml-2 bg-red-700 hover:bg-red-800 hover:cursor-pointer text-white px-4 py-1 rounded-md flex items-center justify-center select-none"
                  onClick={() => {
                    dispatchSale(
                      saleActions.removeSales({
                        salesIds: itemsIdSelected,
                        cashflowIds: cashflowIdSelected,
                      })(dispatchSale),
                    );
                    setItemsIdSelected([]);
                    setCashflowIdSelected([]);
                  }}
                >
                  Eliminar Items Seleccionados
                </div>
              )}

              <span className="ml-2 text-sm">Registros: {salesFiltered.length}</span>
            </div>

            {/* Tabla */}
            <div className="mt-2 h-[40vh] mx-auto max-w overflow-hidden overflow-y-auto overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-800 z-[5]">
                  <tr>
                    <th className="p-2 w-8">
                      <input type="checkbox" className="opacity-50" disabled />
                    </th>
                    {columns.map((col, idx) => (
                      <th
                        key={idx}
                        className={`p-2 text-left cursor-pointer hover:bg-gray-700 transition-colors select-none ${col.width} whitespace-nowrap`}
                        style={col.color ? { color: col.color } : {}}
                        onClick={() => col.sortable && handleSort(col.key)}
                      >
                        <div className="flex items-center">
                          {col.title}
                          {col.sortable && getSortIcon(col.key)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {salesFiltered.map((sale: any, rowIndex: number) => {
                    const isEditing = editableRowId === sale.id;
                    
                    return (
                      <tr
                        key={rowIndex}
                        className={`border-b border-gray-700 cursor-pointer transition-colors ${
                          isEditing
                            ? "bg-cyan-900/40"
                            : sale.type === "ingreso"
                              ? "bg-yellow-900/30"
                              : rowIndex % 2 === 1
                                ? "bg-gray-800/40"
                                : "hover:bg-gray-700/50"
                        }`}
                        onClick={() => handleRowClick(sale)}
                      >
                        {/* Checkbox */}
                        <td className="p-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={
                              sale.id
                                ? itemsIdSelected.some((item: any) => item.id === sale.id) ||
                                  cashflowIdSelected.some((item: any) => item.id === sale.id)
                                : false
                            }
                            onChange={() => {
                              if (sale.type === "ingreso") {
                                setCashflowIdSelected((prev: any) =>
                                  prev.some((item: any) => item.id === sale.id)
                                    ? prev.filter((item: any) => item.id !== sale.id)
                                    : [...prev, { id: sale.id }],
                                );
                              } else {
                                setItemsIdSelected((prev: any) =>
                                  prev.some((item: any) => item.id === sale.id)
                                    ? prev.filter((item: any) => item.id !== sale.id)
                                    : [...prev, { id: sale.id }],
                                );
                              }
                            }}
                          />
                        </td>

                        {/* Columnas */}
                        {columns.map((col, colIndex) => {
                          let displayValue = sale[col.key];

                          // Para ingresos, no mostrar cash
                          if (sale.type === "ingreso" && col.key === "cash") {
                            displayValue = undefined;
                          }

                          // Formatear valor para mostrar
                          const formattedValue =
                            col.format && displayValue !== undefined && displayValue !== null
                              ? col.format(displayValue)
                              : displayValue !== undefined && displayValue !== null
                                ? displayValue
                                : "-";

                          // Celda editable con input (cuando la fila está seleccionada)
                          if (col.editable === true && sale.type !== "ingreso") {
                            if (isEditing) {
                              return (
                                <td key={colIndex} className="p-1" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="text"
                                    readOnly
                                    value={displayValue !== undefined && displayValue !== null ? displayValue : ""}
                                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm cursor-pointer hover:border-cyan-500"
                                    style={col.color ? { color: col.color } : {}}
                                    onClick={(e) => handleInputClick(e, sale, col.key, sale[col.key])}
                                  />
                                </td>
                              );
                            }
                            return (
                              <td
                                key={colIndex}
                                className="p-2"
                                style={col.color ? { color: col.color } : {}}
                              >
                                {formattedValue}
                              </td>
                            );
                          }

                          // Celda editable con Select (Cuenta)
                          if (col.editable === "select" && sale.type !== "ingreso") {
                            if (isEditing) {
                              return (
                                <td key={colIndex} className="p-1" onClick={(e) => e.stopPropagation()}>
                                  <Select
                                    value={sale[col.key] || ""}
                                    className={themeStyles[theme].classNameSelector}
                                    dropdownStyle={themeStyles[theme].dropdownStylesCustom}
                                    popupClassName={themeStyles[theme].classNameSelectorItem}
                                    style={{ width: 110 }}
                                    onSelect={(value: any) => handleAccountChange(sale, value)}
                                    options={accountsForTransfer.map((data: any) => ({
                                      value: data.name,
                                      label: data.name,
                                    }))}
                                  />
                                </td>
                              );
                            }
                            return (
                              <td key={colIndex} className="p-2">
                                {sale[col.key] || "-"}
                              </td>
                            );
                          }

                          // Celda normal (no editable)
                          return (
                            <td
                              key={colIndex}
                              className="p-2"
                              style={col.color ? { color: col.color } : {}}
                            >
                              {formattedValue}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>

                {/* Footer con totales */}
                <tfoot className="sticky bottom-0 bg-cyan-800 font-bold z-[5]">
                  <tr>
                    <td className="p-2"></td>
                    <td className="p-2">TOTALES</td>
                    <td className="p-2"></td>
                    <td className="p-2"></td>
                    <td className="p-2">${formatCurrency(totals.cash)}</td>
                    <td className="p-2">${formatCurrency(totals.transfer)}</td>
                    <td className="p-2" style={{ color: "#93c5fd" }}>{totals.itemsJeans}</td>
                    <td className="p-2" style={{ color: "#86efac" }}>{totals.itemsRemeras}</td>
                    <td className="p-2">{totals.items}</td>
                    <td className="p-2"></td>
                    <td className="p-2">${formatCurrency(totals.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Consolidado por Cuenta - SIEMPRE VISIBLE */}
            {salesFiltered.length > 0 && (
              <div className="mt-4 pt-4 border-t border-cyan-700 h-[22vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-cyan-400 mb-3">
                  Consolidado por Cuenta
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(consolidado).map((cuenta: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-cyan-900/30 border border-cyan-700/50"
                    >
                      <h4 className="font-bold text-cyan-300 mb-2 pb-1 border-b border-cyan-700/50">
                        {cuenta.cuenta}
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Efectivo:</span>
                          <span className="font-medium text-green-400">
                            ${formatCurrency(cuenta.efectivo)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Transferencia:</span>
                          <span className="font-medium text-cyan-400">
                            ${formatCurrency(cuenta.transferencia)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Prendas:</span>
                          <span className="font-medium text-amber-400">
                            {cuenta.prendas}{" "}
                            <span className="text-xs">
                              (<span className="text-blue-400">J:{cuenta.prendasJeans}</span>{" "}
                              <span className="text-green-400">R:{cuenta.prendasRemeras}</span>)
                            </span>
                          </span>
                        </div>
                        <div className="flex justify-between pt-1 mt-1 border-t border-cyan-700/50">
                          <span className="font-bold text-white">Total:</span>
                          <span className="font-bold text-cyan-300">
                            ${formatCurrency(cuenta.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KeyboardNum para edición - envuelto en contenedor con z-index alto */}
            {isModalKeyboardNumOpen && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
                <div className="pointer-events-auto">
                  <KeyboardNum
                    isModalKeyboardNumOpen={isModalKeyboardNumOpen}
                    manualNum={value}
                    handleManualNum={handleManualValue}
                    closeModal={() => {
                      setValue(0);
                      setEditableRowId(null);
                      setIsModalKeyboardNumOpen(false);
                    }}
                    title={"Ingrese " + (mappingConceptToUpdate[propSale.dataIndex] || propSale.dataIndex)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const ModalSaleDetail = ({
  isModalSaleDetailOpen,
  setIsModalSaleDetailOpen,
  sale,
}: any) => {
  const normalizedSale = sale
    ? {
        ...sale,
        itemsJeans:
          (sale.itemsJeans || 0) + (sale.itemsRemeras || 0) > 0
            ? sale.itemsJeans || 0
            : sale.items || 0,
        itemsRemeras:
          (sale.itemsJeans || 0) + (sale.itemsRemeras || 0) > 0
            ? sale.itemsRemeras || 0
            : 0,
      }
    : null;
  const {
    state: { theme, themeStyles },
  } = useTheme();
  const {
    state: { user },
  } = useUser();

  const [description, setDescription] = useState("");
  const [editableRow, setEditableRow] = useState<number | null>(null);
  const [isModalKeyboardNumOpen, setIsModalKeyboardNumOpen] = useState(false);
  const [value, setValue] = useState(0);
  const [propSale, setPropSale] = useState({
    id: "",
    dataIndex: "",
  });

  const {
    state: { loading },
    dispatch: dispatchSale,
  } = useSale();

  const columns = [
    {
      title: "Efectivo",
      dataIndex: "cash",
      editableCell: true,
      type: "string",
      format: (number: any) => `$${formatCurrency(number)}`,
      applyFormat: true,
    },
    {
      title: "Transferencia",
      dataIndex: "transfer",
      editableCell: true,
      type: "string",
      format: (number: any) => `$${formatCurrency(number)}`,
      applyFormat: true,
    },
    {
      title: "Prendas J",
      dataIndex: "itemsJeans",
      editableCell: true,
      type: "string",
    },
    {
      title: "Prendas R",
      dataIndex: "itemsRemeras",
      editableCell: true,
      type: "string",
    },
    {
      title: "Total",
      dataIndex: "total",
      format: (number: any) => `$${formatCurrency(number)}`,
      editableCell: true,
      type: "string",
      applyFormat: true,
    },
  ];

  const handleManualValue = (item: any) => {
    if (item.action === "deleteLast") {
      return setValue((currentValue: any) =>
        Number(String(currentValue).slice(0, -1)),
      );
    }

    if (item.action === "addPrice") {
      dispatchSale(
        saleActions.updateSaleByEmployee({ ...propSale, value })(dispatchSale),
      );
      setValue(0);
      setEditableRow(null);
      return setIsModalKeyboardNumOpen(false);
    }

    setValue((currentValue: any) =>
      Number(String(currentValue) + String(item.value)),
    );
  };

  const handleAction = ({ dataIndex, value, id, inputType }: any) => {
    if (inputType === "string") {
      setPropSale({ dataIndex, id });
      setValue(value ? value : 0);
      setIsModalKeyboardNumOpen(true);
    }
  };

  useEffect(() => {
    if (sale && sale.description) {
      setDescription(sale.description);
    }
  }, []);

  return (
    <>
      {isModalSaleDetailOpen && (
        <div className="fixed inset-0 z-[9999] bg-[#252525] bg-opacity-60 flex items-center justify-center">
          {/* Contenido del modal */}
          <div
            className={`w-[65vh] h-[60vh] p-8 rounded-md shadow-md relative ${themeStyles[theme].tailwindcss.modal}`}
          >
            {/* Icono de cerrar en la esquina superior derecha */}
            <button
              className="absolute top-4 right-4"
              onClick={() => setIsModalSaleDetailOpen(false)}
            >
              <MdClose className="text-2xl" />
            </button>

            <h2 className="text-lg font-bold mb-4">{sale.employee}</h2>
            <div className="mt-5 h-[74vh] mx-auto max-w overflow-hidden overflow-y-auto overflow-x-auto">
              <EditableTable
                data={[normalizedSale]}
                columns={columns}
                handleAction={handleAction}
                editableRow={editableRow}
                handleEditClick={(rowIndex: number) => {
                  setEditableRow(rowIndex);
                }}
                itemsIdSelected={[]}
                setItemsIdSelected={() => {}}
              />

              <KeyboardNum
                isModalKeyboardNumOpen={isModalKeyboardNumOpen}
                manualNum={value}
                handleManualNum={handleManualValue}
                closeModal={() => {
                  setValue(0);
                  setEditableRow(null);
                  setIsModalKeyboardNumOpen(false);
                }}
                title={"Ingrese " + mappingConceptToUpdate[propSale.dataIndex]}
              />
              <div className="mb-2">
                <label className="mb-2 h-[5vh] flex items-center justify-start">
                  Comentario:
                </label>
                <input
                  type="text"
                  value={description}
                  readOnly
                  className={`w-[56vh] p-2 rounded-md mr-2 ${themeStyles[theme].tailwindcss.inputText}`}
                />
              </div>

              <div className="flex items-center justify-center">
                <Keyboard
                  onKeyPress={(e: any) => {
                    let newDescription = description;

                    if (e.action === "deleteLast") {
                      newDescription = newDescription.slice(0, -1);
                    }

                    if (e.action === "addSpace") {
                      newDescription = newDescription + " ";
                    }

                    if (!e.action) {
                      newDescription = newDescription + e.value.toLowerCase();
                    }

                    setDescription(newDescription);
                  }}
                />
              </div>
              <br />

              <div className="flex space-x-4">
                <div
                  className="w-1/2 bg-blue-800 hover:bg-blue-800 hover:cursor-pointer text-white px-4 py-2 rounded-md flex items-center justify-center mx-auto select-none"
                  onClick={() => setIsModalSaleDetailOpen(false)}
                >
                  Cancelar
                </div>
                <div
                  className={`${
                    !Boolean(description.length)
                      ? "bg-gray-500"
                      : "bg-green-800 hover:bg-green-800 hover:cursor-pointer"
                  }  w-1/2 text-white px-4 py-2 rounded-md flex items-center justify-center mx-auto select-none `}
                  onClick={() =>
                    Boolean(description.length) &&
                    dispatchSale(
                      saleActions.updateSaleByEmployee({
                        id: sale.id,
                        dataIndex: "description",
                        value: description,
                      })(dispatchSale),
                    )
                  }
                >
                  Guardar Comentario
                  {loading && (
                    <div className="ml-2">
                      <Spinner />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const SalesByDayContainer = () => {
  const {
    state: { theme, themeStyles },
  } = useTheme();

  const {
    state: {
      salesByEmployees,
      salesTransferByEmployees,
      loading,
      showSuccessToast,
      showErrorToast,
      showSuccessToastMsg,
      lastSaleUpdated,
    },
    dispatch: dispatchSale,
  } = useSale();
  const {
    state: { user },
  } = useUser();
  const { cashiers, fetchAllCashiers, getCashiersForStore } = useCashier();

  let timeoutId: ReturnType<typeof setTimeout>;

  const {
    state: { loading: loadingCashflow, incomes, outgoings },
    dispatch: dispatchCashflow,
  } = useCashflow();
  const [date, setDate] = useState(formatDateToYYYYMMDD(new Date()));
  const [store, setStore] = useState(user.store);
  const [value, setValue] = useState(0);
  const [propSale, setPropSale] = useState({
    id: "",
    dataIndex: "",
  });
  const [isModalKeyboardNumOpen, setIsModalKeyboardNumOpen] = useState(false);
  const [isModalSaleDetailOpen, setIsModalSaleDetailOpen] = useState(false);
  const [isModalListTranferSaleOpen, setIsModalListTranferSaleOpen] =
    useState(false);
  const [isModalListOutgoingOpen, setIsModalListOutgoingOpen] = useState(false);
  const [isModalNewRowSale, setIsModalNewRowSale] = useState(false);
  const [isModalNewNumOrder, setIsModalNewNumOrder] = useState(false);
  const [showToastDetailSale, setShowToastDetailSale] = useState(false);
  const [itemsIdSelected, setItemsIdSelected] = useState<any[]>([]);
  const [cashflowIdSelected, setCashflowIdSelected] = useState<any[]>([]);

  const [editableRow, setEditableRow] = useState<number | null>(null);
  const [employeeSelectedForNewRowSale, setEmployeeSelectedForNewRowSale] =
    useState("");
  const [cashierFilter, setCashierFilter] = useState<string>("none");
  const [isModalCashierTotals, setIsModalCashierTotals] = useState(false);

  // Estados para modales de desglose
  const [isModalCashBreakdown, setIsModalCashBreakdown] = useState(false);
  const [isModalTransferBreakdown, setIsModalTransferBreakdown] =
    useState(false);
  const [isModalItemsBreakdown, setIsModalItemsBreakdown] = useState(false);
  const [isModalDevolutions, setIsModalDevolutions] = useState(false);

  const [totals, setTotals] = useState({
    items: 0,
    cash: 0,
    transfer: 0,
    outgoing: 0,
  });

  const columns = [
    { title: "N°", dataIndex: "order", size: "w-5" },
    {
      title: "Pren",
      dataIndex: "items",
      editableCell: true,
      type: "string",
      sumAcc: true,
    },
    {
      title: "Cash",
      dataIndex: "cash",
      format: (number: any) => `$${formatCurrency(number)}`,
      notZero: true,
      defaultValue: () => "MPC",
      editableCell: true,
      type: "string",
      sumAcc: user.role === "ADMIN",
      applyFormat: true,
      applyFlag: true,
    },
  ];

  const handleManualValue = (item: any) => {
    if (item.action === "deleteLast") {
      return setValue((currentValue: any) =>
        Number(String(currentValue).slice(0, -1)),
      );
    }

    if (item.action === "addPrice") {
      dispatchSale(
        saleActions.updateSaleByEmployee({ ...propSale, value })(dispatchSale),
      );

      setValue(0);
      setEditableRow(null);

      return setIsModalKeyboardNumOpen(false);
    }

    setValue((currentValue: any) =>
      Number(String(currentValue) + String(item.value)),
    );
  };

  const handleNewRowSale = ({ emp }: any) => {
    setEmployeeSelectedForNewRowSale(emp);
    setIsModalNewRowSale(true);
  };

  const handleCountNumOrderByEmployee = ({ emp }: any) => {
    setEmployeeSelectedForNewRowSale(emp);
    setIsModalNewNumOrder(true);
  };

  const [selectedRow, setSelectedRow] = useState<any>(null);

  // Función para manejar la selección de la fila
  const handleRowClick = (row: any, e: any) => {
    setSelectedRow({ ...row, clientX: e.clientX, clientY: e.clientY });
    setShowToastDetailSale(true);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      setShowToastDetailSale(false);
    }, 4000);
  };

  useEffect(() => {
    if (
      lastSaleUpdated &&
      selectedRow &&
      lastSaleUpdated.id === selectedRow.id
    ) {
      setSelectedRow((current: any) => ({ ...current, ...lastSaleUpdated }));
    }
  }, [lastSaleUpdated]);

  const handleItemsSelected = (row: any, checked: any) => {
    const setIdsSelected =
      row.type === "ingreso" ? setCashflowIdSelected : setItemsIdSelected;

    setIdsSelected((items: any) => {
      if (checked) {
        return [...items, { id: row.id }];
      }

      return items.filter((i: any) => i.id !== row.id);
    });
  };

  const isAdmin = user?.role === "ADMIN";
  const userStore = user?.store || "ALL";

  useEffect(() => {
    fetchAllCashiers();
  }, []);

  const filteredCashiers = isAdmin ? cashiers : getCashiersForStore(userStore);

  useEffect(() => {
    setTotals({
      cash: Object.values(salesByEmployees).reduce(
        (acc: any, current: any) =>
          Number(acc) +
          current.reduce(
            (acc: any, current: any) => Number(acc) + (current.cash || 0),
            0,
          ),
        0,
      ),
      items: Object.values(salesByEmployees).reduce(
        (acc: any, current: any) =>
          Number(acc) +
          current.reduce(
            (acc: any, current: any) => Number(acc) + current.items,
            0,
          ),
        0,
      ),
      transfer: salesTransferByEmployees.reduce(
        (acc: any, current: any) => Number(acc) + current.transfer,
        0,
      ),
      outgoing: outgoings.reduce(
        (acc: any, current: any) => Number(acc) + current.amount,
        0,
      ),
    });
  }, [salesByEmployees, salesTransferByEmployees, outgoings]);

  const totalsByCashier = Object.values(salesByEmployees)
    .flat()
    .reduce(
      (acc: any, sale: any) => {
        if (sale.cashierId && sale.cashierName) {
          if (!acc[sale.cashierId]) {
            const cashier = cashiers.find(
              (c: any) => c.id === sale.cashierId || c._id === sale.cashierId,
            );
            acc[sale.cashierId] = {
              name: sale.cashierName,
              color: cashier?.color || "#666",
              items: 0,
              itemsJeans: 0,
              itemsRemeras: 0,
              cash: 0,
              transfer: 0,
            };
          }

          // Normalizar items: si hay desglose J/R usar esos, sino todo a Jeans
          const hasBreakdown =
            (sale.itemsJeans || 0) + (sale.itemsRemeras || 0) > 0;
          const jeans = hasBreakdown ? sale.itemsJeans || 0 : sale.items || 0;
          const remeras = hasBreakdown ? sale.itemsRemeras || 0 : 0;

          acc[sale.cashierId].items += sale.items || 0;
          acc[sale.cashierId].itemsJeans += jeans;
          acc[sale.cashierId].itemsRemeras += remeras;
          acc[sale.cashierId].cash += sale.cash || 0;
          acc[sale.cashierId].transfer += sale.transfer || 0;
        }
        return acc;
      },
      {} as Record<
        string,
        {
          name: string;
          color: string;
          items: number;
          itemsJeans: number;
          itemsRemeras: number;
          cash: number;
          transfer: number;
        }
      >,
    );

  const totalsByCashierArray = Object.values(totalsByCashier) as {
    name: string;
    color: string;
    items: number;
    itemsJeans: number;
    itemsRemeras: number;
    cash: number;
    transfer: number;
  }[];

  const totalItemsAllCashiers = totalsByCashierArray.reduce(
    (acc, c) => acc + c.items,
    0,
  );
  const totalCashAllCashiers = totalsByCashierArray.reduce(
    (acc, c) => acc + c.cash,
    0,
  );
  const totalTransferAllCashiers = totalsByCashierArray.reduce(
    (acc, c) => acc + c.transfer,
    0,
  );
  const totalMoneyAllCashiers = totalCashAllCashiers + totalTransferAllCashiers;
  const totalJeansAllCashiers = totalsByCashierArray.reduce(
    (acc, c) => acc + c.itemsJeans,
    0,
  );
  const totalRemerasAllCashiers = totalsByCashierArray.reduce(
    (acc, c) => acc + c.itemsRemeras,
    0,
  );

  const totalItemsSold = Object.entries(salesByEmployees).reduce(
    (acc: any, current: any) => {
      const [emp, sales] = current;

      return (
        acc + sales.reduce((acc: any, current: any) => acc + current.items, 0)
      );
    },
    0,
  );

  return (
    <>
      <div
        className={`h-10 relative p-2 border ${themeStyles[theme].tailwindcss.border} flex items-center`}
      >
        <div className="inline-block">
          <label className="mr-2">Fecha:</label>

          <DatePicker
            onChange={(date: any) => setDate(date.format("YYYY-MM-DD"))}
            className={themeStyles[theme].datePickerIndicator}
            style={themeStyles[theme].datePicker}
            popupClassName={themeStyles[theme].classNameDatePicker}
            allowClear={false}
            format={dateFormat}
            value={dayjs(date)}
          />
        </div>

        {user.store === "ALL" && (
          <div className="ml-4 inline-block">
            <label className="mr-2">Filtrar por sucursal:</label>

            <Select
              value={mappingListStore[store]}
              className={themeStyles[theme].classNameSelector}
              dropdownStyle={themeStyles[theme].dropdownStylesCustom}
              popupClassName={themeStyles[theme].classNameSelectorItem}
              style={{ width: 110 }}
              onSelect={(value: any) => setStore(value)}
              options={listStore.map((data: any) => ({
                value: data.value,
                label: data.name,
              }))}
            />
          </div>
        )}

        <div
          className="ml-5
         inline-block"
        >
          <div
            className={`inline-block px-4 py-1 rounded-md border text-white select-none ${
              Boolean(date.length) &&
              "bg-[#1b78e2] border-[#1b78e2] hover:cursor-pointer hover:opacity-80 transition-opacity"
            } flex items-center mx-auto`}
            onClick={() => {
              if (!loading) {
                dispatchSale(
                  saleActions.getSalesCashByDay({ date, store })(dispatchSale),
                );

                dispatchSale(
                  saleActions.getSalesTranferByDay({ date, store })(
                    dispatchSale,
                  ),
                );

                dispatchCashflow(
                  cashflowActions.getCashFlowByDay({
                    date,
                    store,
                    type: "egreso",
                  })(dispatchCashflow),
                );
              }
            }}
          >
            Buscar
            {loading && (
              <div className="ml-2">
                <Spinner />
              </div>
            )}
          </div>
        </div>

        <PDFDownloadLink
          document={
            <PdfLocalSale
              salesByEmployees={salesByEmployees}
              date={dayjs(date).format("DD-MM-YYYY")}
              store={mappingListStore[store]}
              totalItemsSold={totalItemsSold}
            />
          }
          fileName={`local-${dayjs(date).format("DD-MM-YYYY")}.pdf`}
          className="w-25 ml-2 bg-cyan-700 hover:bg-green-800 hover:cursor-pointer text-white px-4 py-1 rounded-md flex items-center justify-center select-none"
        >
          {({ loading, url, error, blob }) =>
            loading ? (
              <button>Cargando Documento ...</button>
            ) : (
              <button>Generar PDF</button>
            )
          }
        </PDFDownloadLink>

        {(Boolean(itemsIdSelected.length) ||
          Boolean(cashflowIdSelected.length)) && (
          <div
            className="w-25 ml-2 bg-red-700 hover:bg-red-800 hover:cursor-pointer text-white px-4 py-1 rounded-md flex items-center justify-center select-none"
            onClick={() => {
              dispatchSale(
                saleActions.removeSales({
                  salesIds: itemsIdSelected,
                  cashflowIds: cashflowIdSelected,
                })(dispatchSale),
              );
              setItemsIdSelected([]);
              setCashflowIdSelected([]);
            }}
          >
            Eliminar Items
          </div>
        )}

        <div
          className="w-25 ml-[10vh] bg-blue-700 hover:bg-blue-800 hover:cursor-pointer text-white px-4 py-1 rounded-md flex items-center justify-center select-none"
          onClick={() => {
            dispatchSale(
              saleActions.getSalesTranferByDay({ date, store })(dispatchSale),
            );
            setIsModalListTranferSaleOpen(true);
          }}
        >
          List. de Tranferencias
        </div>

        <div
          className="w-25 ml-2 bg-red-700 hover:bg-red-800 hover:cursor-pointer text-white px-4 py-1 rounded-md flex items-center justify-center select-none"
          onClick={() => {
            setIsModalDevolutions(true);
          }}
        >
          List. de Devoluciones
        </div>

        <div
          className="w-25 ml-2 bg-green-700 hover:bg-green-800 hover:cursor-pointer text-white px-4 py-1 rounded-md flex items-center justify-center select-none"
          onClick={() => {
            dispatchCashflow(
              cashflowActions.getCashFlowByDay({ date, store, type: "egreso" })(
                dispatchCashflow,
              ),
            );
            setIsModalListOutgoingOpen(true);
          }}
        >
          List. de Egresos
        </div>
      </div>

      <div
        className={`h-10 relative p-2 border ${themeStyles[theme].tailwindcss.border} flex items-center`}
      >
        <div className="ml-4 inline-block">
          <label className="mr-2">Cajero:</label>
          <Select
            value={cashierFilter}
            className={themeStyles[theme].classNameSelector}
            dropdownStyle={themeStyles[theme].dropdownStylesCustom}
            popupClassName={themeStyles[theme].classNameSelectorItem}
            style={{ width: 200 }}
            onChange={(value: string) => setCashierFilter(value)}
            optionLabelProp="label"
          >
            <Select.Option value="none" label="Ninguno">
              Ninguno
            </Select.Option>
            <Select.Option value="all" label="Todos">
              Todos
            </Select.Option>
            {filteredCashiers.map((c: any) => (
              <Select.Option
                key={c.id || c._id}
                value={c.id || c._id}
                label={
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: c.color,
                        display: "inline-block",
                      }}
                    />
                    {c.name}
                  </span>
                }
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      backgroundColor: c.color,
                      display: "inline-block",
                    }}
                  />
                  {c.name}
                  {isAdmin && c.store && (
                    <span style={{ opacity: 0.6, fontSize: 11, marginLeft: 4 }}>
                      ({c.isAdmin ? "Admin" : c.store})
                    </span>
                  )}
                </div>
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Leyenda de colores - solo visible cuando filtro es "all" */}
        {cashierFilter === "all" && cashiers.length > 0 && (
          <div className="inline-flex items-center gap-2 px-2 py-1 bg-gray-700/30 rounded">
            {cashiers.map((c: any) => (
              <div
                key={c.id || c._id}
                className="inline-flex items-center gap-1 text-xs text-gray-300"
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: c.color,
                    display: "inline-block",
                  }}
                />
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Botón Totales por Cajero */}
        <div
          className="w-25 ml-2 bg-purple-700 hover:bg-purple-800 hover:cursor-pointer text-white px-4 py-1 rounded-md flex items-center justify-center select-none"
          onClick={() => setIsModalCashierTotals(true)}
        >
          Totales Cajeros
        </div>
      </div>

      <div className="mt-5 h-[68vh] mx-auto max-w overflow-hidden overflow-y-auto overflow-x-auto">
        <div className="flex gap-2">
          {Boolean(Object.entries(salesByEmployees).length) &&
            Object.entries(salesByEmployees).map(
              (saleByEmployee: any, idx: number) => {
                const [emp, sales] = saleByEmployee;
                return (
                  <div className="w-50" key={emp}>
                    <div
                      className={`sticky top-0 z-10 mb-2 flex ${themeStyles[theme].tailwindcss.body}`}
                    >
                      <label className="text-2xl text-base mr-3 ml-auto">
                        {emp}
                      </label>
                      <div
                        className={`w-6 hover:cursor-pointer hover:bg-red-700 flex items-center justify-center rounded-md `}
                        onClick={() => handleCountNumOrderByEmployee({ emp })}
                      >
                        <GrPowerReset className="text-red-500 font-bold" />
                      </div>
                      <div
                        className={`w-6 hover:cursor-pointer hover:bg-green-700 flex items-center justify-center rounded-md`}
                        onClick={() => handleNewRowSale({ emp })}
                      >
                        <FaPlus className="text-green-500 font-bold" />
                      </div>
                    </div>
                    <TableSaleByDay
                      data={sales}
                      columns={columns}
                      table={`${idx}-`}
                      handleRowClick={handleRowClick}
                      handleRowDoubleClick={() =>
                        setIsModalSaleDetailOpen(true)
                      }
                      enableSelectItem={true}
                      rowsSelected={[...itemsIdSelected, ...cashflowIdSelected]}
                      handleItemsSelected={handleItemsSelected}
                      cashierFilter={cashierFilter}
                      cashiers={cashiers}
                    />
                    {Boolean(showToastDetailSale) && Boolean(selectedRow) && (
                      <div
                        className={`absolute shadow-lg rounded-lg p-4 ${themeStyles[theme].tailwindcss.modal}`}
                        style={{
                          top: selectedRow.clientY,
                          left: selectedRow.clientX,
                        }}
                      >
                        <p className="">
                          <>
                            {selectedRow.typeSale === "pedido" && (
                              <div>
                                N° Pedido:
                                <span className="font-bold mx-2">
                                  {selectedRow.order}
                                </span>
                              </div>
                            )}
                            <div>
                              Transferencia:
                              <span className="font-bold mx-2">
                                $
                                {formatCurrency(
                                  selectedRow.transfer
                                    ? selectedRow.transfer
                                    : 0,
                                )}
                              </span>
                            </div>
                            <div>
                              Efectivo:
                              <span className="font-bold mx-2">
                                $
                                {formatCurrency(
                                  selectedRow.cash ? selectedRow.cash : 0,
                                )}
                              </span>
                            </div>

                            {selectedRow.type !== "ingreso" && (
                              <div>
                                Total:
                                <span className="font-bold mx-2">
                                  $
                                  {formatCurrency(
                                    selectedRow.total ? selectedRow.total : 0,
                                  )}
                                </span>
                              </div>
                            )}
                            {selectedRow.description && (
                              <div>
                                Comentario:
                                <span className="font-bold mx-2">
                                  {selectedRow.description}
                                </span>
                              </div>
                            )}
                          </>
                        </p>
                      </div>
                    )}
                  </div>
                );
              },
            )}
        </div>
        <ModalSaleDetail
          isModalSaleDetailOpen={isModalSaleDetailOpen}
          setIsModalSaleDetailOpen={setIsModalSaleDetailOpen}
          sale={selectedRow}
        />
        <ModalListTranferSale
          isModalListTransferSaleOpen={isModalListTranferSaleOpen}
          setIsModalListTransferSaleOpen={setIsModalListTranferSaleOpen}
          date={date}
          sales={salesTransferByEmployees.sort((a, b) => {
            if (a.position === null) return 1;
            if (b.position === null) return -1;
            return a.position - b.position;
          })}
          store={store}
        />
        <ModalListOutgoing
          isModalListOutgoingOpen={isModalListOutgoingOpen}
          setIsModalListOutgoingOpen={setIsModalListOutgoingOpen}
          date={date}
          outgoings={outgoings}
        />
      </div>

      {/* Tags clickeables con modales de desglose */}
      <div className="h-[10vh] mt-[7vh] mx-auto max-w overflow-hidden overflow-y-auto overflow-x-auto">
        {user.role === "ADMIN" && (
          <Tag
            color="blue"
            className="p-2 text-base font-bold cursor-pointer hover:opacity-80"
            onClick={() => setIsModalCashBreakdown(true)}
          >
            Total Cash: ${formatCurrency(totals.cash)}
          </Tag>
        )}
        <Tag
          color="cyan"
          className="p-2 text-base font-bold cursor-pointer hover:opacity-80"
          onClick={() => setIsModalTransferBreakdown(true)}
        >
          Total Transferencia: ${formatCurrency(totals.transfer)}
        </Tag>
        <Tag color="red" className="p-2 text-base font-bold">
          Total Egreso: ${formatCurrency(totals.outgoing)}
        </Tag>
        <Tag
          color="lime"
          className="p-2 text-base font-bold cursor-pointer hover:opacity-80"
          onClick={() => setIsModalItemsBreakdown(true)}
        >
          Total Prendas: {totals.items}
        </Tag>
      </div>

      <KeyboardNum
        isModalKeyboardNumOpen={isModalKeyboardNumOpen}
        manualNum={value}
        handleManualNum={handleManualValue}
        closeModal={() => {
          dispatchSale(
            saleActions.removeEmptyRows({ emp: employeeSelectedForNewRowSale })(
              dispatchSale,
            ),
          );
          setValue(0);
          setEditableRow(null);
          setEmployeeSelectedForNewRowSale("");
          setIsModalKeyboardNumOpen(false);
        }}
        title={"Ingrese " + mappingConceptToUpdate[propSale.dataIndex]}
      />

      <NewRowSale
        isModalNewRowSale={isModalNewRowSale}
        setIsModalNewRowSale={setIsModalNewRowSale}
        employee={employeeSelectedForNewRowSale}
      />

      <NewNumOrder
        isModalNewNumOrder={isModalNewNumOrder}
        setIsModalNewNumOrder={setIsModalNewNumOrder}
        employee={employeeSelectedForNewRowSale}
      />

      {showSuccessToast && (
        <Toast
          type="success"
          message={showSuccessToastMsg}
          onClose={() =>
            dispatchSale(saleActions.setHideToasts()(dispatchSale))
          }
        />
      )}

      {showErrorToast && (
        <Toast
          type="error"
          message={showSuccessToastMsg}
          onClose={() =>
            dispatchSale(saleActions.setHideToasts()(dispatchSale))
          }
        />
      )}

      {/* Modal Totales por Cajero */}
      {isModalCashierTotals && (
        <div className="fixed inset-0 z-[9999] bg-[#252525] bg-opacity-60 flex items-center justify-center">
          <div
            className={`w-[75vh] p-8 rounded-md shadow-md relative ${themeStyles[theme].tailwindcss.modal}`}
          >
            <button
              className="absolute top-4 right-4"
              onClick={() => setIsModalCashierTotals(false)}
            >
              <MdClose className="text-2xl" />
            </button>

            <h2 className="text-lg font-bold mb-4">Totales por Cajero</h2>

            {totalsByCashierArray.length === 0 ? (
              <p className="text-gray-400">No hay ventas con cajero asignado</p>
            ) : (
              <div className="space-y-3">
                {totalsByCashierArray.map((cashier, idx) => {
                  // Calcular porcentajes
                  const itemsPercent =
                    totalItemsAllCashiers > 0
                      ? ((cashier.items / totalItemsAllCashiers) * 100).toFixed(
                          1,
                        )
                      : "0";
                  const cashPercent =
                    totalCashAllCashiers > 0
                      ? ((cashier.cash / totalCashAllCashiers) * 100).toFixed(1)
                      : "0";
                  const transferPercent =
                    totalTransferAllCashiers > 0
                      ? (
                          (cashier.transfer / totalTransferAllCashiers) *
                          100
                        ).toFixed(1)
                      : "0";
                  const moneyPercent =
                    totalMoneyAllCashiers > 0
                      ? (
                          ((cashier.cash + cashier.transfer) /
                            totalMoneyAllCashiers) *
                          100
                        ).toFixed(1)
                      : "0";

                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-md"
                      style={{
                        backgroundColor: cashier.color + "30",
                        borderLeft: `4px solid ${cashier.color}`,
                      }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-lg">
                          {cashier.name}
                        </span>
                        <span className="text-sm px-2 py-1 rounded bg-gray-700/50 text-white font-medium">
                          {moneyPercent}% Cash + Transfer
                        </span>
                      </div>

                      {/* Fila de Cash, Transfer y Prendas */}
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="p-2 rounded bg-green-900/25 border border-green-800/30">
                          <span className="text-gray-400">Cash:</span>
                          <div className="font-bold text-green-400">
                            ${formatCurrency(cashier.cash)}
                          </div>
                          <div className="text-xs text-green-300/70">
                            {cashPercent}% del cash
                          </div>
                        </div>
                        <div className="p-2 rounded bg-cyan-900/25 border border-cyan-800/30">
                          <span className="text-gray-400">Transfer:</span>
                          <div className="font-bold text-cyan-400">
                            ${formatCurrency(cashier.transfer)}
                          </div>
                          <div className="text-xs text-cyan-300/70">
                            {transferPercent}% del transfer
                          </div>
                        </div>
                        <div className="p-2 rounded bg-amber-900/25 border border-amber-800/30">
                          <span className="text-gray-400">Prendas:</span>
                          <div className="font-bold text-amber-400">
                            {cashier.items}{" "}
                            <span className="text-xs font-normal">
                              (
                              <span className="text-blue-400">
                                J:{cashier.itemsJeans}
                              </span>{" "}
                              <span className="text-green-400">
                                R:{cashier.itemsRemeras}
                              </span>
                              )
                            </span>
                          </div>
                          <div className="text-xs text-amber-300/70">
                            {itemsPercent}% de prendas
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Total general */}
                <div className="border-t border-gray-500 pt-3 mt-3">
                  <div className="grid grid-cols-3 gap-2 font-bold">
                    <div className="p-2 rounded bg-green-900/30 border border-green-700/50">
                      <span className="text-gray-400 text-sm">Total Cash:</span>
                      <div className="text-green-400 text-lg">
                        ${formatCurrency(totalCashAllCashiers)}
                      </div>
                    </div>
                    <div className="p-2 rounded bg-cyan-900/30 border border-cyan-700/50">
                      <span className="text-gray-400 text-sm">
                        Total Transfer:
                      </span>
                      <div className="text-cyan-400 text-lg">
                        ${formatCurrency(totalTransferAllCashiers)}
                      </div>
                    </div>
                    <div className="p-2 rounded bg-amber-900/30 border border-amber-700/50">
                      <span className="text-gray-400 text-sm">
                        Total Prendas:
                      </span>
                      <div className="text-amber-400 text-lg">
                        {totalItemsAllCashiers}{" "}
                        <span className="text-sm font-normal">
                          (
                          <span className="text-blue-400">
                            J:{totalJeansAllCashiers}
                          </span>{" "}
                          <span className="text-green-400">
                            R:{totalRemerasAllCashiers}
                          </span>
                          )
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modales de desglose J/R */}
      <ModalCashBreakdown
        isOpen={isModalCashBreakdown}
        setIsOpen={setIsModalCashBreakdown}
        salesData={salesByEmployees}
      />
      <ModalTransferBreakdown
        isOpen={isModalTransferBreakdown}
        setIsOpen={setIsModalTransferBreakdown}
        salesTransferData={salesTransferByEmployees}
      />
      <ModalItemsBreakdown
        isOpen={isModalItemsBreakdown}
        setIsOpen={setIsModalItemsBreakdown}
        salesData={salesByEmployees}
      />
      <ModalListDevolutions
        isOpen={isModalDevolutions}
        setIsOpen={setIsModalDevolutions}
        date={date}
        store={store}
      />
    </>
  );
};

export default SalesByDayContainer;
