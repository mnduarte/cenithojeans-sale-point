import React from "react";
import { Divider, Typography } from "antd";
import { CashierSelectPOS } from "./CashierSelect";
import { useCashier } from "../../contexts/CashierContext";
import { StoredCashier } from "../../utils/cashierStorage";

const { Text } = Typography;

interface CashierHeaderProps {
  store: string;
  isAdmin?: boolean;
}

const CashierHeader: React.FC<CashierHeaderProps> = ({
  store,
  isAdmin = false,
}) => {
  const { selectedCashier, selectCashier } = useCashier();

  const handleCashierSelect = (cashier: StoredCashier | null) => {
    selectCashier(cashier);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <Divider
        type="vertical"
        style={{ height: "30px", borderColor: "#444" }}
      />
      <Text style={{ color: "#fff", fontWeight: 500 }}>Cajero:</Text>
      <CashierSelectPOS
        store={store}
        isAdmin={isAdmin}
        selectedCashier={selectedCashier}
        onSelect={handleCashierSelect}
      />
    </div>
  );
};

export default CashierHeader;

// Hook para validar cajero antes de confirmar venta
export const useCashierValidation = () => {
  const { selectedCashier } = useCashier();

  const validateCashier = (): { valid: boolean; error?: string } => {
    if (!selectedCashier) {
      return {
        valid: false,
        error: "Debe seleccionar un cajero antes de confirmar la venta",
      };
    }
    return { valid: true };
  };

  const getCashierData = () => {
    if (!selectedCashier) return null;
    return {
      cashierId: selectedCashier.id,
      cashierName: selectedCashier.name,
    };
  };

  return {
    selectedCashier,
    validateCashier,
    getCashierData,
    hasCashier: !!selectedCashier,
  };
};
