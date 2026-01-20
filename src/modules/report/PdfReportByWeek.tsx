import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency } from "../../utils/formatUtils";

const colors = {
  primary: "#1a365d",
  secondary: "#2d3748",
  accent: "#3182ce",
  headerBg: "#edf2f7",
  border: "#cbd5e0",
  text: "#1a202c",
  textLight: "#718096",
  devolution: "#c53030",
  totalBg: "#f7fafc",
  white: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Helvetica",
    backgroundColor: colors.white,
  },
  header: {
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 9,
    color: colors.textLight,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  table: {
    width: "auto",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    fontSize: 8,
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderWidth: 0.5,
    borderColor: colors.border,
    textAlign: "center",
    color: colors.text,
  },
  tableCellDev: {
    fontSize: 8,
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderWidth: 0.5,
    borderColor: colors.border,
    textAlign: "center",
    color: colors.devolution,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderWidth: 0.5,
    borderColor: colors.border,
    textAlign: "center",
    backgroundColor: colors.headerBg,
    color: colors.primary,
  },
  tableHeaderCellDev: {
    fontSize: 8,
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderWidth: 0.5,
    borderColor: colors.border,
    textAlign: "center",
    backgroundColor: colors.headerBg,
    color: colors.devolution,
  },
  tableTotalCell: {
    fontSize: 8,
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderWidth: 0.5,
    borderColor: colors.border,
    textAlign: "center",
    backgroundColor: colors.totalBg,
    color: colors.primary,
  },
  tableTotalCellDev: {
    fontSize: 8,
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderWidth: 0.5,
    borderColor: colors.border,
    textAlign: "center",
    backgroundColor: colors.totalBg,
    color: colors.devolution,
  },
  employeesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  employeeTable: {
    marginRight: 4,
    marginBottom: 6,
  },
  employeeHeader: {
    fontSize: 8,
    fontWeight: "bold",
    color: colors.white,
    backgroundColor: colors.accent,
    paddingVertical: 3,
    paddingHorizontal: 2,
    textAlign: "center",
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  // Anchos de columnas - tabla general (más anchos para una línea)
  colDate: { width: 58 },
  colItems: { width: 48 },
  colDev: { width: 28 },
  colMoney: { width: 75 },
  colTotal: { width: 80 },
});

// Tabla para venta LOCAL
const TableLocalGeneral = ({ data }: any) => {
  const totals = data.reduce(
    (acc: any, row: any) => ({
      items: acc.items + (row.items || 0),
      devolutionItems: acc.devolutionItems + (row.devolutionItems || 0),
      outgoings: acc.outgoings + (row.outgoings || 0),
      cash: acc.cash + (row.cash || 0),
      totalBox: acc.totalBox + (row.totalBox || 0),
    }),
    { items: 0, devolutionItems: 0, outgoings: 0, cash: 0, totalBox: 0 }
  );

  return (
    <View style={styles.table} wrap={false}>
      <View style={styles.tableRow}>
        <Text style={[styles.tableHeaderCell, styles.colDate]}>Fecha</Text>
        <Text style={[styles.tableHeaderCell, styles.colItems]}>Prendas</Text>
        <Text style={[styles.tableHeaderCellDev, styles.colDev]}>Dev</Text>
        <Text style={[styles.tableHeaderCell, styles.colMoney]}>Gastos</Text>
        <Text style={[styles.tableHeaderCell, styles.colMoney]}>Venta</Text>
        <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total Caja</Text>
      </View>
      {data.map((row: any, index: number) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.colDate]}>{row.date}</Text>
          <Text style={[styles.tableCell, styles.colItems]}>{row.items || 0}</Text>
          <Text style={[styles.tableCellDev, styles.colDev]}>{row.devolutionItems || 0}</Text>
          <Text style={[styles.tableCell, styles.colMoney]}>${formatCurrency(row.outgoings || 0)}</Text>
          <Text style={[styles.tableCell, styles.colMoney]}>${formatCurrency(row.cash || 0)}</Text>
          <Text style={[styles.tableCell, styles.colTotal]}>${formatCurrency(row.totalBox || 0)}</Text>
        </View>
      ))}
      <View style={styles.tableRow}>
        <Text style={[styles.tableTotalCell, styles.colDate]}>Total</Text>
        <Text style={[styles.tableTotalCell, styles.colItems]}>{totals.items}</Text>
        <Text style={[styles.tableTotalCellDev, styles.colDev]}>{totals.devolutionItems}</Text>
        <Text style={[styles.tableTotalCell, styles.colMoney]}>${formatCurrency(totals.outgoings)}</Text>
        <Text style={[styles.tableTotalCell, styles.colMoney]}>${formatCurrency(totals.cash)}</Text>
        <Text style={[styles.tableTotalCell, styles.colTotal]}>${formatCurrency(totals.totalBox)}</Text>
      </View>
    </View>
  );
};

// Tabla para PEDIDOS
const TablePedidoGeneral = ({ data }: any) => {
  const totals = data.reduce(
    (acc: any, row: any) => ({
      items: acc.items + (row.items || 0),
      devolutionItems: acc.devolutionItems + (row.devolutionItems || 0),
      cash: acc.cash + (row.cash || 0),
      transfer: acc.transfer + (row.transfer || 0),
      total: acc.total + (row.total || 0),
    }),
    { items: 0, devolutionItems: 0, cash: 0, transfer: 0, total: 0 }
  );

  return (
    <View style={styles.table} wrap={false}>
      <View style={styles.tableRow}>
        <Text style={[styles.tableHeaderCell, styles.colDate]}>Fecha</Text>
        <Text style={[styles.tableHeaderCell, styles.colItems]}>Prendas</Text>
        <Text style={[styles.tableHeaderCellDev, styles.colDev]}>Dev</Text>
        <Text style={[styles.tableHeaderCell, styles.colMoney]}>Efectivo</Text>
        <Text style={[styles.tableHeaderCell, styles.colMoney]}>Transfer</Text>
        <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
      </View>
      {data.map((row: any, index: number) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.colDate]}>{row.date}</Text>
          <Text style={[styles.tableCell, styles.colItems]}>{row.items || 0}</Text>
          <Text style={[styles.tableCellDev, styles.colDev]}>{row.devolutionItems || 0}</Text>
          <Text style={[styles.tableCell, styles.colMoney]}>${formatCurrency(row.cash || 0)}</Text>
          <Text style={[styles.tableCell, styles.colMoney]}>${formatCurrency(row.transfer || 0)}</Text>
          <Text style={[styles.tableCell, styles.colTotal]}>${formatCurrency(row.total || 0)}</Text>
        </View>
      ))}
      <View style={styles.tableRow}>
        <Text style={[styles.tableTotalCell, styles.colDate]}>Total</Text>
        <Text style={[styles.tableTotalCell, styles.colItems]}>{totals.items}</Text>
        <Text style={[styles.tableTotalCellDev, styles.colDev]}>{totals.devolutionItems}</Text>
        <Text style={[styles.tableTotalCell, styles.colMoney]}>${formatCurrency(totals.cash)}</Text>
        <Text style={[styles.tableTotalCell, styles.colMoney]}>${formatCurrency(totals.transfer)}</Text>
        <Text style={[styles.tableTotalCell, styles.colTotal]}>${formatCurrency(totals.total)}</Text>
      </View>
    </View>
  );
};

// Tabla por empleado LOCAL
const TableLocalByEmployee = ({ headerTitle, data, showDate }: any) => {
  const totals = data.reduce(
    (acc: any, row: any) => ({
      items: acc.items + (row.items || 0),
      devolutionItems: acc.devolutionItems + (row.devolutionItems || 0),
      total: acc.total + (row.total || row.cash || 0),
    }),
    { items: 0, devolutionItems: 0, total: 0 }
  );

  return (
    <View style={styles.employeeTable} wrap={false}>
      <Text style={styles.employeeHeader}>{headerTitle}</Text>
      <View style={styles.tableRow}>
        {showDate && <Text style={[styles.tableHeaderCell, { width: 52 }]}>Fecha</Text>}
        <Text style={[styles.tableHeaderCell, { width: 42 }]}>Prendas</Text>
        <Text style={[styles.tableHeaderCellDev, { width: 26 }]}>Dev</Text>
        <Text style={[styles.tableHeaderCell, { width: 65 }]}>Venta</Text>
      </View>
      {data.map((row: any, index: number) => (
        <View key={index} style={styles.tableRow}>
          {showDate && <Text style={[styles.tableCell, { width: 52 }]}>{row.date}</Text>}
          <Text style={[styles.tableCell, { width: 42 }]}>{row.items || 0}</Text>
          <Text style={[styles.tableCellDev, { width: 26 }]}>{row.devolutionItems || 0}</Text>
          <Text style={[styles.tableCell, { width: 65 }]}>${formatCurrency(row.total || row.cash || 0)}</Text>
        </View>
      ))}
      <View style={styles.tableRow}>
        {showDate && <Text style={[styles.tableTotalCell, { width: 52 }]}></Text>}
        <Text style={[styles.tableTotalCell, { width: 42 }]}>{totals.items}</Text>
        <Text style={[styles.tableTotalCellDev, { width: 26 }]}>{totals.devolutionItems}</Text>
        <Text style={[styles.tableTotalCell, { width: 65 }]}>${formatCurrency(totals.total)}</Text>
      </View>
    </View>
  );
};

// Tabla por empleado PEDIDO
const TablePedidoByEmployee = ({ headerTitle, data, showDate }: any) => {
  const totals = data.reduce(
    (acc: any, row: any) => ({
      items: acc.items + (row.items || 0),
      devolutionItems: acc.devolutionItems + (row.devolutionItems || 0),
      cash: acc.cash + (row.cash || 0),
      transfer: acc.transfer + (row.transfer || 0),
      total: acc.total + (row.total || 0),
    }),
    { items: 0, devolutionItems: 0, cash: 0, transfer: 0, total: 0 }
  );

  return (
    <View style={styles.employeeTable} wrap={false}>
      <Text style={styles.employeeHeader}>{headerTitle}</Text>
      <View style={styles.tableRow}>
        {showDate && <Text style={[styles.tableHeaderCell, { width: 52 }]}>Fecha</Text>}
        <Text style={[styles.tableHeaderCell, { width: 40 }]}>Prendas</Text>
        <Text style={[styles.tableHeaderCellDev, { width: 24 }]}>Dev</Text>
        <Text style={[styles.tableHeaderCell, { width: 58 }]}>Efect.</Text>
        <Text style={[styles.tableHeaderCell, { width: 58 }]}>Transf.</Text>
        <Text style={[styles.tableHeaderCell, { width: 62 }]}>Total</Text>
      </View>
      {data.map((row: any, index: number) => (
        <View key={index} style={styles.tableRow}>
          {showDate && <Text style={[styles.tableCell, { width: 52 }]}>{row.date}</Text>}
          <Text style={[styles.tableCell, { width: 40 }]}>{row.items || 0}</Text>
          <Text style={[styles.tableCellDev, { width: 24 }]}>{row.devolutionItems || 0}</Text>
          <Text style={[styles.tableCell, { width: 58 }]}>${formatCurrency(row.cash || 0)}</Text>
          <Text style={[styles.tableCell, { width: 58 }]}>${formatCurrency(row.transfer || 0)}</Text>
          <Text style={[styles.tableCell, { width: 62 }]}>${formatCurrency(row.total || 0)}</Text>
        </View>
      ))}
      <View style={styles.tableRow}>
        {showDate && <Text style={[styles.tableTotalCell, { width: 52 }]}></Text>}
        <Text style={[styles.tableTotalCell, { width: 40 }]}>{totals.items}</Text>
        <Text style={[styles.tableTotalCellDev, { width: 24 }]}>{totals.devolutionItems}</Text>
        <Text style={[styles.tableTotalCell, { width: 58 }]}>${formatCurrency(totals.cash)}</Text>
        <Text style={[styles.tableTotalCell, { width: 58 }]}>${formatCurrency(totals.transfer)}</Text>
        <Text style={[styles.tableTotalCell, { width: 62 }]}>${formatCurrency(totals.total)}</Text>
      </View>
    </View>
  );
};

const TableByType: any = {
  local: TableLocalGeneral,
  pedido: TablePedidoGeneral,
};

const TableByEmployeeByType: any = {
  local: TableLocalByEmployee,
  pedido: TablePedidoByEmployee,
};

const PdfReportByWeek = ({
  week,
  store,
  type,
  dataWeek,
  salesByEmployees,
}: any) => {
  const GeneralTable = TableByType[type];
  const EmployeeTable = TableByEmployeeByType[type];
  const typeLabel = type === "local" ? "Venta Local" : "Pedidos";

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Reporte Semana {week} - {store}
          </Text>
          <Text style={styles.headerSubtitle}>
            Tipo: {typeLabel}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen General</Text>
          <GeneralTable data={dataWeek} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalle por Empleado</Text>
          <View style={styles.employeesContainer}>
            {salesByEmployees &&
              salesByEmployees.map((saleByEmployee: any, idx: number) => (
                <EmployeeTable
                  key={idx}
                  headerTitle={saleByEmployee.employee}
                  data={saleByEmployee.sales}
                  showDate={idx === 0}
                />
              ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PdfReportByWeek;
