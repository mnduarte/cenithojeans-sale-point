import React from "react";
import { Select, Typography } from "antd";
import { useCashier } from "../../contexts/CashierContext";
import { getTextColorForBackground } from "../../utils/cashierColors";

const { Text } = Typography;

export type CashierFilterValue = "none" | "all" | string;

interface CashierFilterProps {
  store: string;
  isAdmin?: boolean;
  value: CashierFilterValue;
  onChange: (value: CashierFilterValue) => void;
  label?: string;
  style?: React.CSSProperties;
}

const CashierFilter: React.FC<CashierFilterProps> = ({
  store,
  isAdmin = false,
  value,
  onChange,
  label = "Cajero:",
  style,
}) => {
  const { cashiers, getCashiersForStore } = useCashier();

  const filteredCashiers = isAdmin ? cashiers : getCashiersForStore(store);

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: "8px", ...style }}
    >
      {label && <Text style={{ color: "#fff" }}>{label}</Text>}
      <Select
        value={value}
        onChange={onChange}
        style={{ minWidth: 150 }}
        dropdownStyle={{ minWidth: 180 }}
      >
        <Select.Option value="none">
          <span style={{ color: "#999" }}>Ninguno</span>
        </Select.Option>
        <Select.Option value="all">
          <span style={{ fontWeight: 500 }}>Todos</span>
        </Select.Option>
        {filteredCashiers.map((cashier: any) => (
          <Select.Option key={cashier.id} value={cashier.id}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  backgroundColor: cashier.color,
                  borderRadius: "3px",
                  flexShrink: 0,
                }}
              />
              <span>{cashier.name}</span>
            </div>
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default CashierFilter;

// Utilidad para obtener el estilo de fila basado en el cajero
interface CashierRowStyleOptions {
  cashierId?: string;
  cashierName?: string;
  lastEditCashierId?: string;
  checkoutCashierId?: string;
  filterValue: CashierFilterValue;
}

export const getCashierRowStyle = (
  options: CashierRowStyleOptions,
  cashiers: Array<{ id: string; color: string }>
): React.CSSProperties | undefined => {
  const { cashierId, lastEditCashierId, checkoutCashierId, filterValue } =
    options;

  // Si el filtro es "none", no colorear
  if (filterValue === "none") {
    return undefined;
  }

  // Determinar qué cajero usar para el color (prioridad: checkout > lastEdit > original)
  const relevantCashierId = checkoutCashierId || lastEditCashierId || cashierId;

  if (!relevantCashierId) {
    return undefined;
  }

  // Si el filtro es "all" o es el cajero específico seleccionado
  if (filterValue === "all" || filterValue === relevantCashierId) {
    const cashier = cashiers.find((c) => c.id === relevantCashierId);
    if (cashier) {
      return {
        backgroundColor: cashier.color,
        color: getTextColorForBackground(cashier.color),
      };
    }
  }

  return undefined;
};

// Utilidad para filtrar datos por cajero
export const filterDataByCashier = <
  T extends {
    cashierId?: string;
    lastEditCashierId?: string;
    checkoutCashierId?: string;
  }
>(
  data: T[],
  filterValue: CashierFilterValue
): T[] => {
  if (filterValue === "none" || filterValue === "all") {
    return data;
  }

  return data.filter((item) => {
    return (
      item.cashierId === filterValue ||
      item.lastEditCashierId === filterValue ||
      item.checkoutCashierId === filterValue
    );
  });
};

// Componente para mostrar cajero en columna Fecha
interface CashierDateCellProps {
  date: string;
  cashierName?: string;
}

export const CashierDateCell: React.FC<CashierDateCellProps> = ({
  date,
  cashierName,
}) => {
  return (
    <span>
      {date}
      {cashierName && (
        <>
          {" | "}
          <span style={{ fontWeight: 500 }}>{cashierName}</span>
        </>
      )}
    </span>
  );
};

// Hook para calcular totales por cajero
interface CashierTotals {
  items: number;
  cash: number;
  transfer: number;
}

export const useCashierTotals = (
  data: Array<{
    cashierId?: string;
    items?: number;
    cash?: number;
    transfer?: number;
    devolutionItems?: number;
  }>,
  selectedCashierId: string | null
): CashierTotals | null => {
  if (
    !selectedCashierId ||
    selectedCashierId === "none" ||
    selectedCashierId === "all"
  ) {
    return null;
  }

  const filteredData = data.filter(
    (item) => item.cashierId === selectedCashierId
  );

  return filteredData.reduce(
    (acc: any, item) => ({
      items: acc.items + (item.items || 0) - (item.devolutionItems || 0),
      cash: acc.cash + (item.cash || 0),
      transfer: acc.transfer + (item.transfer || 0),
    }),
    { items: 0, cash: 0, transfer: 0 }
  );
};
