import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency } from "../../utils/formatUtils";

// A4 landscape content width: 841 - 30 padding = 811pt
// Each table: 92pt wide + 5pt gap = 97pt → 8 tables per row
const TABLES_PER_ROW = 8;

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
  totalText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0891b2",
  },
  employeeRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  tableContainer: {
    width: 92,
    marginRight: 5,
  },
  employeeHeader: {
    backgroundColor: "#0891b2",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    paddingVertical: 3,
    paddingHorizontal: 2,
    textAlign: "center",
  },
  employeeHeaderText: {
    color: "#ffffff",
    fontSize: 6,
    fontWeight: "bold",
  },
  colHeader: {
    flexDirection: "row",
    backgroundColor: "#164e63",
  },
  colHeaderCell: {
    color: "#e0f2fe",
    fontSize: 6,
    fontWeight: "bold",
    paddingVertical: 2,
    paddingHorizontal: 1,
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
  tableRowIngreso: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fef3c7",
  },
  tableCell: {
    fontSize: 6,
    paddingVertical: 2,
    paddingHorizontal: 1,
    textAlign: "center",
  },
  tableFooter: {
    flexDirection: "row",
    backgroundColor: "#0891b2",
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  tableFooterCell: {
    color: "#ffffff",
    fontSize: 6,
    fontWeight: "bold",
    paddingVertical: 2,
    paddingHorizontal: 1,
    textAlign: "center",
  },
  colOrder: { width: 22 },
  colItems: { width: 18 },
  colCash: { width: 52 },
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

const EmployeeTable = ({ employee, sales }: any) => {
  const totalItems = sales.reduce(
    (acc: number, s: any) => acc + (s.items || 0),
    0
  );
  const totalCash = sales.reduce(
    (acc: number, s: any) => acc + (s.cash || 0),
    0
  );

  return (
    <View style={styles.tableContainer}>
      {/* Employee name header */}
      <View style={styles.employeeHeader}>
        <Text style={styles.employeeHeaderText}>
          {employee}
        </Text>
      </View>

      {/* Column headers */}
      <View style={styles.colHeader}>
        <View style={styles.colOrder}>
          <Text style={styles.colHeaderCell}>N°</Text>
        </View>
        <View style={styles.colItems}>
          <Text style={styles.colHeaderCell}>Prend</Text>
        </View>
        <View style={styles.colCash}>
          <Text style={styles.colHeaderCell}>Efectivo</Text>
        </View>
      </View>

      {/* Data rows */}
      {sales.map((row: any, index: number) => (
        <View
          key={index}
          style={
            row.type === "ingreso"
              ? styles.tableRowIngreso
              : index % 2 === 0
              ? styles.tableRow
              : styles.tableRowAlt
          }
        >
          <View style={styles.colOrder}>
            <Text style={styles.tableCell}>{row.order || "-"}</Text>
          </View>
          <View style={styles.colItems}>
            <Text style={styles.tableCell}>{row.items || 0}</Text>
          </View>
          <View style={styles.colCash}>
            <Text style={styles.tableCell}>
              {row.cash === 0 ? "MP" : `$${formatCurrency(row.cash)}`}
            </Text>
          </View>
        </View>
      ))}

      {/* Footer with totals */}
      <View style={styles.tableFooter}>
        <View style={styles.colOrder}>
          <Text style={styles.tableFooterCell}></Text>
        </View>
        <View style={styles.colItems}>
          <Text style={styles.tableFooterCell}>{totalItems}</Text>
        </View>
        <View style={styles.colCash}>
          <Text style={styles.tableFooterCell}>
            {totalCash > 0 ? `$${formatCurrency(totalCash)}` : "-"}
          </Text>
        </View>
      </View>
    </View>
  );
};

const PdfLocalSale = ({ salesByEmployees, date, store, totalItemsSold }: any) => {
  const allEmployees = Object.entries(salesByEmployees) as [string, any[]][];

  // Split employees into rows of TABLES_PER_ROW to prevent page cuts
  const employeeRows: [string, any[]][][]= [];
  for (let i = 0; i < allEmployees.length; i += TABLES_PER_ROW) {
    employeeRows.push(allEmployees.slice(i, i + TABLES_PER_ROW));
  }

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Venta Local</Text>
            <Text style={styles.subtitle}>
              Fecha: {date} | Sucursal: {store}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.totalText}>
              Total: {totalItemsSold} prendas
            </Text>
          </View>
        </View>

        {/* Employee tables — each row wrapped to prevent page cuts */}
        {employeeRows.map((rowGroup, rowIdx) => (
          <View key={rowIdx} style={styles.employeeRow} wrap={false}>
            {rowGroup.map(([emp, sales], idx) => (
              <EmployeeTable key={idx} employee={emp} sales={sales} />
            ))}
          </View>
        ))}

        {/* Page footer */}
        <Text style={styles.footerInfo}>
          Documento generado automáticamente –{" "}
          {new Date().toLocaleString("es-AR")}
        </Text>
      </Page>
    </Document>
  );
};

export default PdfLocalSale;
