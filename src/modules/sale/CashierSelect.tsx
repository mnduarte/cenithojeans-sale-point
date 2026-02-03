import React from "react";
import { Select } from "antd";
import { useCashier } from "../../contexts/CashierContext";
import { getTextColorForBackground } from "../../utils/cashierColors";
import { StoredCashier } from "../../utils/cashierStorage";

interface CashierSelectProps {
  store: string;
  isAdmin?: boolean;
  showAllOption?: boolean;
  showNoneOption?: boolean;
  value?: string | null;
  onChange?: (cashierId: string | null, cashier: StoredCashier | null) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  size?: "small" | "middle" | "large";
  disabled?: boolean;
}

const CashierSelect: React.FC<CashierSelectProps> = ({
  store,
  isAdmin = false,
  showAllOption = false,
  showNoneOption = true,
  value,
  onChange,
  placeholder = "Seleccione cajero",
  style,
  size = "middle",
  disabled = false,
}) => {
  const { cashiers, getCashiersForStore } = useCashier();

  // Filtrar cajeros por sucursal (admin ve todos)
  const filteredCashiers = isAdmin
    ? cashiers
    : getCashiersForStore(store);

  const handleChange = (selectedValue: string | null) => {
    if (selectedValue === "none" || !selectedValue) {
      onChange?.(null, null);
    } else if (selectedValue === "all") {
      onChange?.("all", null);
    } else {
      const cashier = filteredCashiers.find((c:any) => c.id === selectedValue);
      if (cashier) {
        onChange?.(cashier.id, {
          id: cashier.id,
          name: cashier.name,
          color: cashier.color,
          store: cashier.store,
        });
      }
    }
  };

  return (
    <Select
      value={value || undefined}
      onChange={handleChange}
      placeholder={placeholder}
      style={{ minWidth: 150, ...style }}
      size={size}
      disabled={disabled}
      allowClear
      onClear={() => onChange?.(null, null)}
    >
      {showNoneOption && (
        <Select.Option value="none">
          <span style={{ color: "#999" }}>Ninguno</span>
        </Select.Option>
      )}
      {showAllOption && (
        <Select.Option value="all">
          <span style={{ fontWeight: 500 }}>Todos</span>
        </Select.Option>
      )}
      {filteredCashiers.map((cashier:any) => (
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
                width: "16px",
                height: "16px",
                backgroundColor: cashier.color,
                borderRadius: "3px",
                flexShrink: 0,
              }}
            />
            <span>{cashier.name}</span>
            {isAdmin && cashier.store && (
              <span style={{ color: "#888", fontSize: "12px" }}>
                ({cashier.store})
              </span>
            )}
          </div>
        </Select.Option>
      ))}
    </Select>
  );
};

export default CashierSelect;

// Componente para el selector de cajero en el POS (con colores de fondo)
interface CashierSelectPOSProps {
  store: string;
  isAdmin?: boolean;
  selectedCashier: StoredCashier | null;
  onSelect: (cashier: StoredCashier | null) => void;
}

export const CashierSelectPOS: React.FC<CashierSelectPOSProps> = ({
  store,
  isAdmin = false,
  selectedCashier,
  onSelect,
}) => {
  const { cashiers, getCashiersForStore } = useCashier();

  const filteredCashiers = isAdmin ? cashiers : getCashiersForStore(store);

  const handleChange = (selectedValue: string | null) => {
    if (!selectedValue) {
      onSelect(null);
    } else {
      const cashier = filteredCashiers.find((c:any) => c.id === selectedValue);
      if (cashier) {
        onSelect({
          id: cashier.id,
          name: cashier.name,
          color: cashier.color,
          store: cashier.store,
        });
      }
    }
  };

  return (
    <Select
      value={selectedCashier?.id || undefined}
      onChange={handleChange}
      placeholder="Cajero"
      style={{
        minWidth: 140,
        backgroundColor: selectedCashier?.color || undefined,
      }}
      dropdownStyle={{ minWidth: 180 }}
      allowClear
      onClear={() => onSelect(null)}
    >
      {filteredCashiers.map((cashier:any) => (
        <Select.Option key={cashier.id} value={cashier.id}>
          <div
            style={{
              backgroundColor: cashier.color,
              color: getTextColorForBackground(cashier.color),
              padding: "2px 8px",
              borderRadius: "3px",
              margin: "-2px -8px",
            }}
          >
            {cashier.name}
          </div>
        </Select.Option>
      ))}
    </Select>
  );
};
