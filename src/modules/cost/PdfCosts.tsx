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
    borderBottomColor: "#7c3aed",
    paddingBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerLeft: { flex: 1 },
  headerRight: { textAlign: "right" },
  title: { fontSize: 12, fontWeight: "bold", color: "#7c3aed", marginBottom: 3 },
  subtitle: { fontSize: 8, color: "#666666" },
  registrosText: { fontSize: 10, fontWeight: "bold", color: "#7c3aed" },
  table: { display: "flex", width: "100%", marginTop: 6 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#7c3aed",
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
  tableRowAlt: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  tableRowApproved: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#d1fae5",
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
  tableCellAmount: {
    paddingVertical: 3,
    paddingHorizontal: 2,
    fontSize: 6,
    textAlign: "center",
    color: "#7c3aed",
    fontWeight: "bold",
  },
  tableFooter: {
    flexDirection: "row",
    backgroundColor: "#7c3aed",
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
  colFecha: { width: "9%" },
  colCuenta: { width: "14%" },
  colNumOrden: { width: "7%" },
  colVendedor: { width: "13%" },
  colItems: { width: "6%" },
  colMonto: { width: "13%" },
  colTipo: { width: "10%" },
  colAprobado: { width: "8%" },
  colSalida: { width: "10%" },
  colCliente: { width: "10%" },
});

const PdfCosts = ({ costs, startDate, endDate, store }: any) => {
  const totalMonto = costs.reduce(
    (acc: number, c: any) => acc + (c.amount || 0),
    0
  );

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Listado de Pagos</Text>
            <Text style={styles.subtitle}>
              Período: {startDate} - {endDate} | Sucursal: {store}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.registrosText}>
              Registros: {costs.length}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.colFecha}><Text style={styles.tableHeaderCell}>Fecha</Text></View>
            <View style={styles.colCuenta}><Text style={styles.tableHeaderCell}>Cuenta</Text></View>
            <View style={styles.colNumOrden}><Text style={styles.tableHeaderCell}>N° Orden</Text></View>
            <View style={styles.colVendedor}><Text style={styles.tableHeaderCell}>Vendedor</Text></View>
            <View style={styles.colCliente}><Text style={styles.tableHeaderCell}>Cliente</Text></View>
            <View style={styles.colItems}><Text style={styles.tableHeaderCell}>Items</Text></View>
            <View style={styles.colMonto}><Text style={styles.tableHeaderCell}>Monto</Text></View>
            <View style={styles.colTipo}><Text style={styles.tableHeaderCell}>Tipo</Text></View>
            <View style={styles.colAprobado}><Text style={styles.tableHeaderCell}>Aprobado</Text></View>
            <View style={styles.colSalida}><Text style={styles.tableHeaderCell}>Salida</Text></View>
          </View>

          {costs.map((cost: any, index: number) => (
            <View
              key={index}
              style={
                cost.approved
                  ? styles.tableRowApproved
                  : index % 2 === 0
                  ? styles.tableRow
                  : styles.tableRowAlt
              }
            >
              <View style={styles.colFecha}><Text style={styles.tableCell}>{cost.date || "-"}</Text></View>
              <View style={styles.colCuenta}><Text style={styles.tableCellLeft}>{cost.account || "-"}</Text></View>
              <View style={styles.colNumOrden}><Text style={styles.tableCell}>{cost.numOrder || "-"}</Text></View>
              <View style={styles.colVendedor}><Text style={styles.tableCellLeft}>{cost.employee || "-"}</Text></View>
              <View style={styles.colCliente}><Text style={styles.tableCellLeft}>{cost.customer || "-"}</Text></View>
              <View style={styles.colItems}><Text style={styles.tableCell}>{cost.items || "-"}</Text></View>
              <View style={styles.colMonto}>
                <Text style={styles.tableCellAmount}>${formatCurrency(cost.amount || 0)}</Text>
              </View>
              <View style={styles.colTipo}><Text style={styles.tableCell}>{cost.typeShipment || "-"}</Text></View>
              <View style={styles.colAprobado}>
                <Text style={styles.tableCell}>{cost.approved ? "Sí" : "No"}</Text>
              </View>
              <View style={styles.colSalida}><Text style={styles.tableCell}>{cost.checkoutDate || "-"}</Text></View>
            </View>
          ))}

          <View style={styles.tableFooter}>
            <View style={styles.colFecha}><Text style={styles.tableFooterCell}></Text></View>
            <View style={styles.colCuenta}><Text style={styles.tableFooterCell}></Text></View>
            <View style={styles.colNumOrden}><Text style={styles.tableFooterCell}></Text></View>
            <View style={styles.colVendedor}><Text style={styles.tableFooterCell}>TOTAL</Text></View>
            <View style={styles.colCliente}><Text style={styles.tableFooterCell}></Text></View>
            <View style={styles.colItems}><Text style={styles.tableFooterCell}></Text></View>
            <View style={styles.colMonto}><Text style={styles.tableFooterCell}>${formatCurrency(totalMonto)}</Text></View>
            <View style={styles.colTipo}><Text style={styles.tableFooterCell}></Text></View>
            <View style={styles.colAprobado}><Text style={styles.tableFooterCell}></Text></View>
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

export default PdfCosts;
