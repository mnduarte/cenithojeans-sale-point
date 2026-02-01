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
  // Column widths optimizados para A5
  colOrder: { width: "6%" },
  colVendedor: { width: "13%" },
  colHora: { width: "8%" },
  colEfectivo: { width: "13%" },
  colTransfer: { width: "13%" },
  colPrendas: { width: "8%" },
  colCuenta: { width: "22%" },
  colTotal: { width: "13%" },
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
            <Text style={styles.registrosText}>Registros: {totalRegistros}</Text>
          </View>
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
