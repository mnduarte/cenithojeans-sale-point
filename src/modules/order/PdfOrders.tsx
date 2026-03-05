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
  headerLeft: { flex: 1 },
  headerRight: { textAlign: "right" },
  title: { fontSize: 12, fontWeight: "bold", color: "#0891b2", marginBottom: 3 },
  subtitle: { fontSize: 8, color: "#666666" },
  registrosText: { fontSize: 10, fontWeight: "bold", color: "#0891b2" },
  table: { display: "flex", width: "100%", marginTop: 6 },
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
  tableRowAlt: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  tableRowCancelled: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fee2e2",
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
  colNum: { width: "5%" },
  colFecha: { width: "8%" },
  colVendedor: { width: "13%" },
  colTipo: { width: "9%" },
  colPJ: { width: "6%" },
  colPR: { width: "6%" },
  colPrendas: { width: "6%" },
  colEfectivo: { width: "13%" },
  colTransfer: { width: "13%" },
  colTotal: { width: "13%" },
  colSalida: { width: "8%" },
});

const PdfOrders = ({ orders, startDate, endDate, store }: any) => {
  const active = orders.filter((o: any) => !o.cancelled);

  const totals = active.reduce(
    (acc: any, o: any) => ({
      itemsJeans: acc.itemsJeans + (o.itemsJeans || 0),
      itemsRemeras: acc.itemsRemeras + (o.itemsRemeras || 0),
      items: acc.items + (o.items || 0),
      cash: acc.cash + (o.cash || 0),
      transfer: acc.transfer + (o.transfer || 0),
      total: acc.total + (o.total || 0),
    }),
    { itemsJeans: 0, itemsRemeras: 0, items: 0, cash: 0, transfer: 0, total: 0 }
  );

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Listado de Pedidos</Text>
            <Text style={styles.subtitle}>
              Período: {startDate} - {endDate} | Sucursal: {store}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.registrosText}>
              Registros: {active.length}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.colNum}><Text style={styles.tableHeaderCell}>N°</Text></View>
            <View style={styles.colFecha}><Text style={styles.tableHeaderCell}>Fecha</Text></View>
            <View style={styles.colVendedor}><Text style={styles.tableHeaderCell}>Vendedor</Text></View>
            <View style={styles.colTipo}><Text style={styles.tableHeaderCell}>Tipo</Text></View>
            <View style={styles.colPJ}><Text style={styles.tableHeaderCellBlue}>P.J</Text></View>
            <View style={styles.colPR}><Text style={styles.tableHeaderCellGreen}>P.R</Text></View>
            <View style={styles.colPrendas}><Text style={styles.tableHeaderCell}>Pren.</Text></View>
            <View style={styles.colEfectivo}><Text style={styles.tableHeaderCell}>Efectivo</Text></View>
            <View style={styles.colTransfer}><Text style={styles.tableHeaderCell}>Transfer</Text></View>
            <View style={styles.colTotal}><Text style={styles.tableHeaderCell}>Total</Text></View>
            <View style={styles.colSalida}><Text style={styles.tableHeaderCell}>Salida</Text></View>
          </View>

          {orders.map((order: any, index: number) => (
            <View
              key={index}
              style={
                order.cancelled
                  ? styles.tableRowCancelled
                  : index % 2 === 0
                  ? styles.tableRow
                  : styles.tableRowAlt
              }
            >
              <View style={styles.colNum}><Text style={styles.tableCell}>{order.order || "-"}</Text></View>
              <View style={styles.colFecha}><Text style={styles.tableCell}>{order.date || "-"}</Text></View>
              <View style={styles.colVendedor}><Text style={styles.tableCellLeft}>{order.employee || "-"}</Text></View>
              <View style={styles.colTipo}><Text style={styles.tableCell}>{order.typeShipment || "-"}</Text></View>
              <View style={styles.colPJ}><Text style={styles.tableCellBlue}>{order.itemsJeans ?? 0}</Text></View>
              <View style={styles.colPR}><Text style={styles.tableCellGreen}>{order.itemsRemeras ?? 0}</Text></View>
              <View style={styles.colPrendas}><Text style={styles.tableCell}>{order.items || 0}</Text></View>
              <View style={styles.colEfectivo}>
                <Text style={styles.tableCell}>
                  {order.cash ? `$${formatCurrency(order.cash)}` : "-"}
                </Text>
              </View>
              <View style={styles.colTransfer}>
                <Text style={styles.tableCell}>
                  {order.transfer ? `$${formatCurrency(order.transfer)}` : "-"}
                </Text>
              </View>
              <View style={styles.colTotal}>
                <Text style={styles.tableCell}>${formatCurrency(order.total || 0)}</Text>
              </View>
              <View style={styles.colSalida}><Text style={styles.tableCell}>{order.checkoutDate || "-"}</Text></View>
            </View>
          ))}

          <View style={styles.tableFooter}>
            <View style={styles.colNum}><Text style={styles.tableFooterCell}></Text></View>
            <View style={styles.colFecha}><Text style={styles.tableFooterCell}></Text></View>
            <View style={styles.colVendedor}><Text style={styles.tableFooterCell}>TOTALES</Text></View>
            <View style={styles.colTipo}><Text style={styles.tableFooterCell}></Text></View>
            <View style={styles.colPJ}><Text style={styles.tableFooterCellBlue}>{totals.itemsJeans}</Text></View>
            <View style={styles.colPR}><Text style={styles.tableFooterCellGreen}>{totals.itemsRemeras}</Text></View>
            <View style={styles.colPrendas}><Text style={styles.tableFooterCell}>{totals.items}</Text></View>
            <View style={styles.colEfectivo}><Text style={styles.tableFooterCell}>${formatCurrency(totals.cash)}</Text></View>
            <View style={styles.colTransfer}><Text style={styles.tableFooterCell}>${formatCurrency(totals.transfer)}</Text></View>
            <View style={styles.colTotal}><Text style={styles.tableFooterCell}>${formatCurrency(totals.total)}</Text></View>
            <View style={styles.colSalida}><Text style={styles.tableFooterCell}></Text></View>
          </View>
        </View>

        <Text style={styles.footerInfo}>
          Documento generado automáticamente - {new Date().toLocaleString("es-AR")}
        </Text>
      </Page>
    </Document>
  );
};

export default PdfOrders;
