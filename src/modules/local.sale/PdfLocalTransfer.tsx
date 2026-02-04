import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency } from "../../utils/formatUtils";

const styles = StyleSheet.create({
  page: {
    padding: 15,
    fontSize: 7,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#0891b2",
    paddingBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    textAlign: "right",
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0891b2",
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 8,
    color: "#666666",
  },
  registrosText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0891b2",
  },
  table: {
    display: "flex",
    width: "100%",
    marginTop: 6,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0891b2",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tableHeaderCell: {
    color: "#ffffff",
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 2,
    fontSize: 6,
    textAlign: "center",
  },
  tableHeaderCellBlue: {
    color: "#93c5fd",
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 2,
    fontSize: 6,
    textAlign: "center",
  },
  tableHeaderCellGreen: {
    color: "#86efac",
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 2,
    fontSize: 6,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  tableRowAlternate: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  tableRowIngreso: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fef3c7",
  },
  tableCell: {
    paddingVertical: 3,
    paddingHorizontal: 2,
    fontSize: 6,
    textAlign: "center",
  },
  tableCellLeft: {
    paddingVertical: 3,
    paddingHorizontal: 2,
    fontSize: 6,
    textAlign: "left",
  },
  tableCellBlue: {
    paddingVertical: 3,
    paddingHorizontal: 2,
    fontSize: 6,
    textAlign: "center",
    color: "#2563eb",
  },
  tableCellGreen: {
    paddingVertical: 3,
    paddingHorizontal: 2,
    fontSize: 6,
    textAlign: "center",
    color: "#16a34a",
  },
  // Column widths optimizados para A5 con nuevas columnas
  colOrder: { width: "5%" },
  colVendedor: { width: "11%" },
  colHora: { width: "7%" },
  colEfectivo: { width: "11%" },
  colTransfer: { width: "11%" },
  colPrendasJ: { width: "7%" },
  colPrendasR: { width: "7%" },
  colPrendas: { width: "7%" },
  colCuenta: { width: "18%" },
  colTotal: { width: "11%" },
  // Footer
  tableFooter: {
    flexDirection: "row",
    backgroundColor: "#0891b2",
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  tableFooterCell: {
    color: "#ffffff",
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 2,
    fontSize: 6,
    textAlign: "center",
  },
  tableFooterCellBlue: {
    color: "#93c5fd",
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 2,
    fontSize: 6,
    textAlign: "center",
  },
  tableFooterCellGreen: {
    color: "#86efac",
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 2,
    fontSize: 6,
    textAlign: "center",
  },
  // Footer info
  footerInfo: {
    position: "absolute",
    bottom: 10,
    left: 15,
    right: 15,
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 6,
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
    paddingTop: 5,
  },
  // Consolidado por cuenta
  consolidadoSection: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#0891b2",
  },
  consolidadoTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0891b2",
    marginBottom: 6,
  },
  consolidadoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  consolidadoCard: {
    width: "48%",
    backgroundColor: "#f0fdfa",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#0891b2",
    padding: 6,
    marginBottom: 6,
  },
  consolidadoCardTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0891b2",
    marginBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#0891b2",
    paddingBottom: 2,
  },
  consolidadoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  consolidadoLabel: {
    fontSize: 6,
    color: "#666666",
  },
  consolidadoValue: {
    fontSize: 6,
    fontWeight: "bold",
    color: "#333333",
  },
  consolidadoValueBlue: {
    fontSize: 6,
    fontWeight: "bold",
    color: "#2563eb",
  },
  consolidadoValueGreen: {
    fontSize: 6,
    fontWeight: "bold",
    color: "#16a34a",
  },
  consolidadoTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 3,
    paddingTop: 3,
    borderTopWidth: 0.5,
    borderTopColor: "#0891b2",
  },
  consolidadoTotalLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#0891b2",
  },
  consolidadoTotalValue: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#0891b2",
  },
});

const formatTime = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const TableListTransfer = ({ data }: any) => {
  const totals = data.reduce(
    (acc: any, current: any) => ({
      efectivo: acc.efectivo + (current.cash || 0),
      transferencia: acc.transferencia + (current.transfer || 0),
      prendasJeans: acc.prendasJeans + (current.itemsJeans || 0),
      prendasRemeras: acc.prendasRemeras + (current.itemsRemeras || 0),
      prendas: acc.prendas + (current.items || 0),
      total: acc.total + (current.total || 0),
    }),
    { efectivo: 0, transferencia: 0, prendasJeans: 0, prendasRemeras: 0, prendas: 0, total: 0 }
  );

  return (
    <View style={styles.table}>
      {/* Header */}
      <View style={styles.tableHeader}>
        <View style={styles.colOrder}>
          <Text style={styles.tableHeaderCell}>N°</Text>
        </View>
        <View style={styles.colVendedor}>
          <Text style={styles.tableHeaderCell}>Vendedor</Text>
        </View>
        <View style={styles.colHora}>
          <Text style={styles.tableHeaderCell}>Hora</Text>
        </View>
        <View style={styles.colEfectivo}>
          <Text style={styles.tableHeaderCell}>Efectivo</Text>
        </View>
        <View style={styles.colTransfer}>
          <Text style={styles.tableHeaderCell}>Transfer</Text>
        </View>
        <View style={styles.colPrendasJ}>
          <Text style={styles.tableHeaderCellBlue}>Prend J</Text>
        </View>
        <View style={styles.colPrendasR}>
          <Text style={styles.tableHeaderCellGreen}>Prend R</Text>
        </View>
        <View style={styles.colPrendas}>
          <Text style={styles.tableHeaderCell}>Prendas</Text>
        </View>
        <View style={styles.colCuenta}>
          <Text style={styles.tableHeaderCell}>Cuenta</Text>
        </View>
        <View style={styles.colTotal}>
          <Text style={styles.tableHeaderCell}>Total</Text>
        </View>
      </View>

      {/* Body */}
      {data.map((item: any, index: number) => (
        <View
          key={index}
          style={
            item.type === "ingreso"
              ? styles.tableRowIngreso
              : index % 2 === 0
              ? styles.tableRow
              : styles.tableRowAlternate
          }
        >
          <View style={styles.colOrder}>
            <Text style={styles.tableCell}>{item.order || "-"}</Text>
          </View>
          <View style={styles.colVendedor}>
            <Text style={styles.tableCellLeft}>{item.employee || "-"}</Text>
          </View>
          <View style={styles.colHora}>
            <Text style={styles.tableCell}>{formatTime(item.createdAt)}</Text>
          </View>
          <View style={styles.colEfectivo}>
            <Text style={styles.tableCell}>
              {item.cash ? `$${formatCurrency(item.cash)}` : "-"}
            </Text>
          </View>
          <View style={styles.colTransfer}>
            <Text style={styles.tableCell}>
              ${formatCurrency(item.transfer || 0)}
            </Text>
          </View>
          <View style={styles.colPrendasJ}>
            <Text style={styles.tableCellBlue}>{item.itemsJeans || 0}</Text>
          </View>
          <View style={styles.colPrendasR}>
            <Text style={styles.tableCellGreen}>{item.itemsRemeras || 0}</Text>
          </View>
          <View style={styles.colPrendas}>
            <Text style={styles.tableCell}>{item.items || 0}</Text>
          </View>
          <View style={styles.colCuenta}>
            <Text style={styles.tableCellLeft}>
              {item.accountForTransfer || "-"}
            </Text>
          </View>
          <View style={styles.colTotal}>
            <Text style={styles.tableCell}>
              ${formatCurrency(item.total || 0)}
            </Text>
          </View>
        </View>
      ))}

      {/* Footer */}
      <View style={styles.tableFooter}>
        <View style={styles.colOrder}>
          <Text style={styles.tableFooterCell}></Text>
        </View>
        <View style={styles.colVendedor}>
          <Text style={styles.tableFooterCell}>TOTALES</Text>
        </View>
        <View style={styles.colHora}>
          <Text style={styles.tableFooterCell}></Text>
        </View>
        <View style={styles.colEfectivo}>
          <Text style={styles.tableFooterCell}>
            ${formatCurrency(totals.efectivo)}
          </Text>
        </View>
        <View style={styles.colTransfer}>
          <Text style={styles.tableFooterCell}>
            ${formatCurrency(totals.transferencia)}
          </Text>
        </View>
        <View style={styles.colPrendasJ}>
          <Text style={styles.tableFooterCellBlue}>{totals.prendasJeans}</Text>
        </View>
        <View style={styles.colPrendasR}>
          <Text style={styles.tableFooterCellGreen}>{totals.prendasRemeras}</Text>
        </View>
        <View style={styles.colPrendas}>
          <Text style={styles.tableFooterCell}>{totals.prendas}</Text>
        </View>
        <View style={styles.colCuenta}>
          <Text style={styles.tableFooterCell}></Text>
        </View>
        <View style={styles.colTotal}>
          <Text style={styles.tableFooterCell}>
            ${formatCurrency(totals.total)}
          </Text>
        </View>
      </View>
    </View>
  );
};

// Componente para el consolidado por cuenta
// wrap={false} evita que se corte entre páginas
const ConsolidadoPorCuenta = ({ data }: any) => {
  // Agrupar por cuenta
  const consolidado = data.reduce((acc: any, sale: any) => {
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
  }, {});

  const cuentasArray = Object.values(consolidado) as any[];

  if (cuentasArray.length === 0) return null;

  return (
    <View style={styles.consolidadoSection} wrap={false}>
      <Text style={styles.consolidadoTitle}>Consolidado por Cuenta</Text>
      <View style={styles.consolidadoGrid}>
        {cuentasArray.map((cuenta: any, index: number) => (
          <View key={index} style={styles.consolidadoCard}>
            <Text style={styles.consolidadoCardTitle}>{cuenta.cuenta}</Text>
            <View style={styles.consolidadoRow}>
              <Text style={styles.consolidadoLabel}>Efectivo:</Text>
              <Text style={styles.consolidadoValue}>
                ${formatCurrency(cuenta.efectivo)}
              </Text>
            </View>
            <View style={styles.consolidadoRow}>
              <Text style={styles.consolidadoLabel}>Transferencia:</Text>
              <Text style={styles.consolidadoValue}>
                ${formatCurrency(cuenta.transferencia)}
              </Text>
            </View>
            <View style={styles.consolidadoRow}>
              <Text style={styles.consolidadoLabel}>Prendas J:</Text>
              <Text style={styles.consolidadoValueBlue}>{cuenta.prendasJeans}</Text>
            </View>
            <View style={styles.consolidadoRow}>
              <Text style={styles.consolidadoLabel}>Prendas R:</Text>
              <Text style={styles.consolidadoValueGreen}>{cuenta.prendasRemeras}</Text>
            </View>
            <View style={styles.consolidadoRow}>
              <Text style={styles.consolidadoLabel}>Prendas Total:</Text>
              <Text style={styles.consolidadoValue}>{cuenta.prendas}</Text>
            </View>
            <View style={styles.consolidadoTotal}>
              <Text style={styles.consolidadoTotalLabel}>Total:</Text>
              <Text style={styles.consolidadoTotalValue}>
                ${formatCurrency(cuenta.total)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const PdfLocalTransfer = ({
  date,
  store,
  data,
  showConsolidado = true,
}: any) => {
  const totalRegistros = data.length;

  return (
    <Document>
      <Page size="A5" orientation="landscape" style={styles.page}>
        {/* Header con registros a la derecha */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Listado de Transferencias</Text>
            <Text style={styles.subtitle}>
              Fecha: {date} | Sucursal: {store}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.registrosText}>
              Registros: {totalRegistros}
            </Text>
          </View>
        </View>

        {/* Table */}
        <TableListTransfer data={data} />

        {/* Consolidado por cuenta - solo si showConsolidado es true */}
        {/* wrap={false} hace que si no cabe completo, se mueva a la siguiente página */}
        {showConsolidado && <ConsolidadoPorCuenta data={data} />}

        {/* Footer */}
        <Text style={styles.footerInfo}>
          Documento generado automáticamente -{" "}
          {new Date().toLocaleString("es-AR")}
        </Text>
      </Page>
    </Document>
  );
};

export default PdfLocalTransfer;
