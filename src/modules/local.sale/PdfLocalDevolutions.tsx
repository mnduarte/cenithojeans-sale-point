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
    borderBottomColor: "#dc2626",
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#dc2626",
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
  },
  tableHeaderCellBlue: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: "bold",
    padding: 5,
    fontSize: 7,
    textAlign: "center",
  },
  tableHeaderCellRed: {
    backgroundColor: "#dc2626",
    color: "#ffffff",
    fontWeight: "bold",
    padding: 5,
    fontSize: 7,
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
  tableCellBlue: {
    padding: 5,
    fontSize: 7,
    textAlign: "center",
    color: "#1e40af",
  },
  tableCellRed: {
    padding: 5,
    fontSize: 7,
    textAlign: "center",
    color: "#dc2626",
  },
  tableCellLeft: {
    padding: 5,
    fontSize: 7,
    textAlign: "left",
  },
  // Column widths for detailed view (with N°) - Total: 100%
  colOrder: { width: "5%" },
  colVendedor: { width: "13%" },
  colPrendas: { width: "9%" },
  colDevTotal: { width: "9%" },
  colDevJeans: { width: "9%" },
  colDevRemeras: { width: "9%" },
  colMontoJeans: { width: "15%" },
  colMontoRemeras: { width: "15%" },
  colMontoTotal: { width: "16%" },
  // Column widths for consolidated view (same columns, no N°) - Total: 100%
  colConsVendedor: { width: "14%" },
  colConsPrendas: { width: "10%" },
  colConsDevTotal: { width: "10%" },
  colConsDevJeans: { width: "10%" },
  colConsDevRemeras: { width: "10%" },
  colConsMontoJeans: { width: "15%" },
  colConsMontoRemeras: { width: "15%" },
  colConsMontoTotal: { width: "16%" },
  // Footer - sin background para evitar columna extra
  tableFooter: {
    flexDirection: "row",
    width: "100%",
  },
  tableFooterCellBlue: {
    backgroundColor: "#1e40af",
    color: "#ffffff",
    fontWeight: "bold",
    padding: 5,
    fontSize: 7,
    textAlign: "center",
  },
  tableFooterCellRed: {
    backgroundColor: "#991b1b",
    color: "#ffffff",
    fontWeight: "bold",
    padding: 5,
    fontSize: 7,
    textAlign: "center",
  },
  // Summary section
  summaryContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fef2f2",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#dc2626",
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#dc2626",
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
    color: "#dc2626",
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
  // Consolidated title
  consolidatedTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
    marginTop: 5,
  },
  footerTextBlue: {
    color: "#ffffff",
    fontWeight: "bold",
    padding: 5,
    fontSize: 7,
    textAlign: "center",
  },
  footerTextRed: {
    color: "#ffffff",
    fontWeight: "bold",
    padding: 5,
    fontSize: 7,
    textAlign: "center",
  },
});

// Table for detailed view (individual sales)
const TableDetailedDevolutions = ({ data }: any) => {
  const totals = data.reduce(
    (acc: any, current: any) => ({
      prendas: acc.prendas + (current.items || 0),
      devTotal: acc.devTotal + (current.devolutionItems || 0),
      devJeans: acc.devJeans + (current.itemsDevolutionJeans || 0),
      devRemeras: acc.devRemeras + (current.itemsDevolutionRemeras || 0),
      montoJeans: acc.montoJeans + (current.montoDevolucionJeans || 0),
      montoRemeras: acc.montoRemeras + (current.montoDevolucionRemeras || 0),
      montoTotal: acc.montoTotal + (current.subTotalDevolutionItems || 0),
    }),
    {
      prendas: 0,
      devTotal: 0,
      devJeans: 0,
      devRemeras: 0,
      montoJeans: 0,
      montoRemeras: 0,
      montoTotal: 0,
    }
  );

  return (
    <View style={styles.table}>
      {/* Header */}
      <View style={styles.tableHeader}>
        <View style={styles.colOrder}>
          <Text style={styles.tableHeaderCellBlue}>N°</Text>
        </View>
        <View style={styles.colVendedor}>
          <Text style={styles.tableHeaderCellBlue}>Vendedor</Text>
        </View>
        <View style={styles.colPrendas}>
          <Text style={styles.tableHeaderCellBlue}>Prendas</Text>
        </View>
        <View style={styles.colDevTotal}>
          <Text style={styles.tableHeaderCellRed}>Devueltas</Text>
        </View>
        <View style={styles.colDevJeans}>
          <Text style={styles.tableHeaderCellRed}>Dev. J</Text>
        </View>
        <View style={styles.colDevRemeras}>
          <Text style={styles.tableHeaderCellRed}>Dev. R</Text>
        </View>
        <View style={styles.colMontoJeans}>
          <Text style={styles.tableHeaderCellRed}>Monto J</Text>
        </View>
        <View style={styles.colMontoRemeras}>
          <Text style={styles.tableHeaderCellRed}>Monto R</Text>
        </View>
        <View style={styles.colMontoTotal}>
          <Text style={styles.tableHeaderCellRed}>Monto Total</Text>
        </View>
      </View>

      {/* Body */}
      {data.map((item: any, index: number) => (
        <View
          key={index}
          style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}
        >
          <View style={styles.colOrder}>
            <Text style={styles.tableCellBlue}>{item.order || "-"}</Text>
          </View>
          <View style={styles.colVendedor}>
            <Text style={{ ...styles.tableCellLeft, color: "#1e40af" }}>
              {item.employee || "-"}
            </Text>
          </View>
          <View style={styles.colPrendas}>
            <Text style={styles.tableCellBlue}>{item.items || 0}</Text>
          </View>
          <View style={styles.colDevTotal}>
            <Text style={styles.tableCellRed}>{item.devolutionItems || 0}</Text>
          </View>
          <View style={styles.colDevJeans}>
            <Text style={styles.tableCellRed}>
              {item.itemsDevolutionJeans || 0}
            </Text>
          </View>
          <View style={styles.colDevRemeras}>
            <Text style={styles.tableCellRed}>
              {item.itemsDevolutionRemeras || 0}
            </Text>
          </View>
          <View style={styles.colMontoJeans}>
            <Text style={styles.tableCellRed}>
              ${formatCurrency(item.montoDevolucionJeans || 0)}
            </Text>
          </View>
          <View style={styles.colMontoRemeras}>
            <Text style={styles.tableCellRed}>
              ${formatCurrency(item.montoDevolucionRemeras || 0)}
            </Text>
          </View>
          <View style={styles.colMontoTotal}>
            <Text style={styles.tableCellRed}>
              ${formatCurrency(item.subTotalDevolutionItems || 0)}
            </Text>
          </View>
        </View>
      ))}

      {/* Footer */}
      <View style={styles.tableFooter}>
        <View style={[styles.colOrder, { backgroundColor: "#1e40af" }]}>
          <Text style={styles.footerTextBlue}></Text>
        </View>
        <View style={[styles.colVendedor, { backgroundColor: "#1e40af" }]}>
          <Text style={styles.footerTextBlue}>TOTALES</Text>
        </View>
        <View style={[styles.colPrendas, { backgroundColor: "#1e40af" }]}>
          <Text style={styles.footerTextBlue}>{totals.prendas}</Text>
        </View>
        <View style={[styles.colDevTotal, { backgroundColor: "#991b1b" }]}>
          <Text style={styles.footerTextRed}>{totals.devTotal}</Text>
        </View>
        <View style={[styles.colDevJeans, { backgroundColor: "#991b1b" }]}>
          <Text style={styles.footerTextRed}>{totals.devJeans}</Text>
        </View>
        <View style={[styles.colDevRemeras, { backgroundColor: "#991b1b" }]}>
          <Text style={styles.footerTextRed}>{totals.devRemeras}</Text>
        </View>
        <View style={[styles.colMontoJeans, { backgroundColor: "#991b1b" }]}>
          <Text style={styles.footerTextRed}>
            ${formatCurrency(totals.montoJeans)}
          </Text>
        </View>
        <View style={[styles.colMontoRemeras, { backgroundColor: "#991b1b" }]}>
          <Text style={styles.footerTextRed}>
            ${formatCurrency(totals.montoRemeras)}
          </Text>
        </View>
        <View style={[styles.colMontoTotal, { backgroundColor: "#991b1b" }]}>
          <Text style={styles.footerTextRed}>
            ${formatCurrency(totals.montoTotal)}
          </Text>
        </View>
      </View>
    </View>
  );
};

// Table for consolidated view (grouped by employee) - SAME COLUMNS as detailed but without N°
const TableConsolidatedDevolutions = ({ data }: any) => {
  // Group by employee
  const groupedByEmployee = data.reduce((acc: any, sale: any) => {
    const emp = sale.employee || "Sin vendedor";
    if (!acc[emp]) {
      acc[emp] = {
        employee: emp,
        prendas: 0,
        devTotal: 0,
        devJeans: 0,
        devRemeras: 0,
        montoJeans: 0,
        montoRemeras: 0,
        montoTotal: 0,
      };
    }
    acc[emp].prendas += sale.items || 0;
    acc[emp].devTotal += sale.devolutionItems || 0;
    acc[emp].devJeans += sale.itemsDevolutionJeans || 0;
    acc[emp].devRemeras += sale.itemsDevolutionRemeras || 0;
    acc[emp].montoJeans += sale.montoDevolucionJeans || 0;
    acc[emp].montoRemeras += sale.montoDevolucionRemeras || 0;
    acc[emp].montoTotal += sale.subTotalDevolutionItems || 0;
    return acc;
  }, {});

  const consolidatedData = Object.values(groupedByEmployee);

  const totals: any = consolidatedData.reduce(
    (acc: any, current: any) => ({
      prendas: acc.prendas + current.prendas,
      devTotal: acc.devTotal + current.devTotal,
      devJeans: acc.devJeans + current.devJeans,
      devRemeras: acc.devRemeras + current.devRemeras,
      montoJeans: acc.montoJeans + current.montoJeans,
      montoRemeras: acc.montoRemeras + current.montoRemeras,
      montoTotal: acc.montoTotal + current.montoTotal,
    }),
    {
      prendas: 0,
      devTotal: 0,
      devJeans: 0,
      devRemeras: 0,
      montoJeans: 0,
      montoRemeras: 0,
      montoTotal: 0,
    }
  );

  return (
    <View style={styles.table}>
      {/* Header */}
      <View style={styles.tableHeader}>
        <View style={styles.colConsVendedor}>
          <Text style={styles.tableHeaderCellBlue}>Vendedor</Text>
        </View>
        <View style={styles.colConsPrendas}>
          <Text style={styles.tableHeaderCellBlue}>Prendas</Text>
        </View>
        <View style={styles.colConsDevTotal}>
          <Text style={styles.tableHeaderCellRed}>Devueltas</Text>
        </View>
        <View style={styles.colConsDevJeans}>
          <Text style={styles.tableHeaderCellRed}>Dev. J</Text>
        </View>
        <View style={styles.colConsDevRemeras}>
          <Text style={styles.tableHeaderCellRed}>Dev. R</Text>
        </View>
        <View style={styles.colConsMontoJeans}>
          <Text style={styles.tableHeaderCellRed}>Monto J</Text>
        </View>
        <View style={styles.colConsMontoRemeras}>
          <Text style={styles.tableHeaderCellRed}>Monto R</Text>
        </View>
        <View style={styles.colConsMontoTotal}>
          <Text style={styles.tableHeaderCellRed}>Monto Total</Text>
        </View>
      </View>

      {/* Body */}
      {consolidatedData.map((item: any, index: number) => (
        <View
          key={index}
          style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}
        >
          <View style={styles.colConsVendedor}>
            <Text style={{ ...styles.tableCellLeft, color: "#1e40af" }}>
              {item.employee}
            </Text>
          </View>
          <View style={styles.colConsPrendas}>
            <Text style={styles.tableCellBlue}>{item.prendas}</Text>
          </View>
          <View style={styles.colConsDevTotal}>
            <Text style={styles.tableCellRed}>{item.devTotal}</Text>
          </View>
          <View style={styles.colConsDevJeans}>
            <Text style={styles.tableCellRed}>{item.devJeans}</Text>
          </View>
          <View style={styles.colConsDevRemeras}>
            <Text style={styles.tableCellRed}>{item.devRemeras}</Text>
          </View>
          <View style={styles.colConsMontoJeans}>
            <Text style={styles.tableCellRed}>
              ${formatCurrency(item.montoJeans)}
            </Text>
          </View>
          <View style={styles.colConsMontoRemeras}>
            <Text style={styles.tableCellRed}>
              ${formatCurrency(item.montoRemeras)}
            </Text>
          </View>
          <View style={styles.colConsMontoTotal}>
            <Text style={styles.tableCellRed}>
              ${formatCurrency(item.montoTotal)}
            </Text>
          </View>
        </View>
      ))}

      {/* Footer */}
      <View style={styles.tableFooter}>
        <View style={[styles.colConsVendedor, { backgroundColor: "#1e40af" }]}>
          <Text style={styles.footerTextBlue}>TOTALES</Text>
        </View>
        <View style={[styles.colConsPrendas, { backgroundColor: "#1e40af" }]}>
          <Text style={styles.footerTextBlue}>{totals.prendas}</Text>
        </View>
        <View style={[styles.colConsDevTotal, { backgroundColor: "#991b1b" }]}>
          <Text style={styles.footerTextRed}>{totals.devTotal}</Text>
        </View>
        <View style={[styles.colConsDevJeans, { backgroundColor: "#991b1b" }]}>
          <Text style={styles.footerTextRed}>{totals.devJeans}</Text>
        </View>
        <View style={[styles.colConsDevRemeras, { backgroundColor: "#991b1b" }]}>
          <Text style={styles.footerTextRed}>{totals.devRemeras}</Text>
        </View>
        <View style={[styles.colConsMontoJeans, { backgroundColor: "#991b1b" }]}>
          <Text style={styles.footerTextRed}>
            ${formatCurrency(totals.montoJeans)}
          </Text>
        </View>
        <View style={[styles.colConsMontoRemeras, { backgroundColor: "#991b1b" }]}>
          <Text style={styles.footerTextRed}>
            ${formatCurrency(totals.montoRemeras)}
          </Text>
        </View>
        <View style={[styles.colConsMontoTotal, { backgroundColor: "#991b1b" }]}>
          <Text style={styles.footerTextRed}>
            ${formatCurrency(totals.montoTotal)}
          </Text>
        </View>
      </View>
    </View>
  );
};

interface PdfLocalDevolutionsProps {
  date: string;
  store: string;
  data: any[];
  isConsolidated: boolean;
  selectedEmployee?: string;
}

const PdfLocalDevolutions = ({
  date,
  store,
  data,
  isConsolidated,
  selectedEmployee,
}: PdfLocalDevolutionsProps) => {
  const totalDevueltas = data.reduce(
    (acc: any, curr: any) => acc + (curr.devolutionItems || 0),
    0
  );
  const montoTotalDevuelto = data.reduce(
    (acc: any, curr: any) => acc + (curr.subTotalDevolutionItems || 0),
    0
  );

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Listado de Devoluciones</Text>
          <Text style={styles.subtitle}>
            Fecha: {date} | Sucursal: {store} |{" "}
            {isConsolidated
              ? "Vista Consolidada"
              : `Vendedor: ${selectedEmployee || "Todos"}`}
          </Text>
        </View>

        {/* Table */}
        {isConsolidated ? (
          <>
            <Text style={styles.consolidatedTitle}>Resumen por Vendedor</Text>
            <TableConsolidatedDevolutions data={data} />
          </>
        ) : (
          <>
            <Text style={styles.consolidatedTitle}>
              Detalle de Ventas - {selectedEmployee}
            </Text>
            <TableDetailedDevolutions data={data} />
          </>
        )}

        {/* Footer */}
        <Text style={styles.footerInfo}>
          Documento generado automáticamente -{" "}
          {new Date().toLocaleString("es-AR")}
        </Text>
      </Page>
    </Document>
  );
};

export default PdfLocalDevolutions;
