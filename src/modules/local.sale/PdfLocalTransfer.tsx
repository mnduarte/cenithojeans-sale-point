import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency } from "../../utils/formatUtils";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#0891b2",
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0891b2",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: "#666666",
  },
  table: {
    display: "flex",
    width: "100%",
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0891b2",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    color: "#ffffff",
    fontWeight: "bold",
    padding: 8,
    fontSize: 8,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRowAlternate: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  tableRowIngreso: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fef3c7",
  },
  tableCell: {
    padding: 8,
    fontSize: 8,
    textAlign: "center",
  },
  tableCellLeft: {
    padding: 8,
    fontSize: 8,
    textAlign: "left",
  },
  // Column widths
  colOrder: { width: "6%" },
  colVendedor: { width: "14%" },
  colHora: { width: "8%" },
  colEfectivo: { width: "12%" },
  colTransfer: { width: "12%" },
  colPrendas: { width: "10%" },
  colCuenta: { width: "20%" },
  colTotal: { width: "12%" },
  // Footer
  tableFooter: {
    flexDirection: "row",
    backgroundColor: "#0891b2",
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  tableFooterCell: {
    color: "#ffffff",
    fontWeight: "bold",
    padding: 8,
    fontSize: 8,
    textAlign: "center",
  },
  // Summary section
  summaryContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f0fdfa",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#0891b2",
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0891b2",
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 9,
    color: "#374151",
  },
  summaryValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0891b2",
  },
  // Footer info
  footerInfo: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
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
      prendas: acc.prendas + (current.items || 0),
      total: acc.total + (current.total || 0),
    }),
    { efectivo: 0, transferencia: 0, prendas: 0, total: 0 }
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

const PdfLocalTransfer = ({ date, store, data }: any) => {
  const totalRegistros = data.length;
  const totalTransferencias = data.reduce(
    (acc: any, curr: any) => acc + (curr.transfer || 0),
    0
  );
  const totalEfectivo = data.reduce(
    (acc: any, curr: any) => acc + (curr.cash || 0),
    0
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Listado de Transferencias</Text>
          <Text style={styles.subtitle}>
            Fecha: {date} | Sucursal: {store} | Registros: {totalRegistros}
          </Text>
        </View>

        {/* Table */}
        <TableListTransfer data={data} />

        {/* Footer */}
        <Text style={styles.footerInfo}>
          Documento generado automáticamente - {new Date().toLocaleString("es-AR")}
        </Text>
      </Page>
    </Document>
  );
};

export default PdfLocalTransfer;
