import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

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
  sectionBg: "#f8fafc",
};

const styles = StyleSheet.create({
  page: {
    padding: 18,
    fontFamily: "Helvetica",
    backgroundColor: colors.white,
  },
  header: {
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.primary,
  },
  branchSection: {
    marginBottom: 6,
    padding: 8,
    backgroundColor: colors.sectionBg,
    borderRadius: 3,
  },
  branchTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
  },
  sectionLabel: {
    fontSize: 8,
    color: colors.textLight,
    marginTop: 6,
    marginBottom: 3,
  },
  table: {
    width: "auto",
    marginBottom: 3,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    fontSize: 7,
    paddingVertical: 3,
    paddingHorizontal: 3,
    borderWidth: 0.5,
    borderColor: colors.border,
    textAlign: "center",
    color: colors.text,
    width: 50,
  },
  tableCellWide: {
    fontSize: 7,
    paddingVertical: 3,
    paddingHorizontal: 3,
    borderWidth: 0.5,
    borderColor: colors.border,
    textAlign: "left",
    color: colors.text,
    width: 70,
  },
  tableCellDev: {
    fontSize: 7,
    paddingVertical: 3,
    paddingHorizontal: 3,
    borderWidth: 0.5,
    borderColor: colors.border,
    textAlign: "center",
    color: colors.devolution,
    width: 50,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: "bold",
    paddingVertical: 3,
    paddingHorizontal: 3,
    borderWidth: 0.5,
    borderColor: colors.border,
    textAlign: "center",
    backgroundColor: colors.headerBg,
    color: colors.primary,
    width: 50,
  },
  tableHeaderCellWide: {
    fontSize: 7,
    fontWeight: "bold",
    paddingVertical: 3,
    paddingHorizontal: 3,
    borderWidth: 0.5,
    borderColor: colors.border,
    textAlign: "center",
    backgroundColor: colors.headerBg,
    color: colors.primary,
    width: 70,
  },
  tableHeaderCellDev: {
    fontSize: 7,
    fontWeight: "bold",
    paddingVertical: 3,
    paddingHorizontal: 3,
    borderWidth: 0.5,
    borderColor: colors.border,
    textAlign: "center",
    backgroundColor: colors.headerBg,
    color: colors.devolution,
    width: 50,
  },
  tableTotalCell: {
    fontSize: 7,
    fontWeight: "bold",
    paddingVertical: 3,
    paddingHorizontal: 3,
    borderWidth: 0.5,
    borderColor: colors.border,
    textAlign: "center",
    backgroundColor: colors.totalBg,
    color: colors.primary,
    width: 50,
  },
  tableTotalCellWide: {
    fontSize: 7,
    fontWeight: "bold",
    paddingVertical: 3,
    paddingHorizontal: 3,
    borderWidth: 0.5,
    borderColor: colors.border,
    textAlign: "left",
    backgroundColor: colors.totalBg,
    color: colors.primary,
    width: 70,
  },
  tableTotalCellDev: {
    fontSize: 7,
    fontWeight: "bold",
    paddingVertical: 3,
    paddingHorizontal: 3,
    borderWidth: 0.5,
    borderColor: colors.border,
    textAlign: "center",
    backgroundColor: colors.totalBg,
    color: colors.devolution,
    width: 50,
  },
  totalLine: {
    fontSize: 8,
    color: colors.secondary,
    marginTop: 3,
    marginBottom: 4,
  },
  totalLineValue: {
    fontWeight: "bold",
    color: colors.primary,
  },
  totalLineDev: {
    color: colors.devolution,
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    marginVertical: 4,
  },
  grandTotal: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: 8,
    padding: 6,
    backgroundColor: colors.headerBg,
    borderRadius: 3,
  },
  grandTotalDev: {
    color: colors.devolution,
  },
});

type Column = {
  title: string;
  dataIndex: string;
  isDevolution?: boolean;
};

type TableProps = {
  columns: Column[];
  data: Record<string, any>[];
  firstColumnWidth?: number;
};

const Table = ({ columns, data, firstColumnWidth }: TableProps) => (
  <View style={styles.table} wrap={false}>
    <View style={styles.tableRow}>
      {columns.map((col, idx) => (
        <Text
          key={idx}
          style={
            col.isDevolution
              ? firstColumnWidth && idx === 0
                ? { ...styles.tableHeaderCellDev, width: firstColumnWidth }
                : styles.tableHeaderCellDev
              : firstColumnWidth && idx === 0
              ? { ...styles.tableHeaderCellWide, width: firstColumnWidth }
              : styles.tableHeaderCell
          }
        >
          {col.title}
        </Text>
      ))}
    </View>
    {data.map((row, i) => {
      const isLastRow = i === data.length - 1 && row.label === "Total:";
      return (
        <View key={i} style={styles.tableRow}>
          {columns.map((col, idx) => (
            <Text
              key={idx}
              style={
                isLastRow
                  ? col.isDevolution
                    ? firstColumnWidth && idx === 0
                      ? { ...styles.tableTotalCellDev, width: firstColumnWidth }
                      : styles.tableTotalCellDev
                    : firstColumnWidth && idx === 0
                    ? { ...styles.tableTotalCellWide, width: firstColumnWidth }
                    : styles.tableTotalCell
                  : col.isDevolution
                  ? firstColumnWidth && idx === 0
                    ? { ...styles.tableCellDev, width: firstColumnWidth, textAlign: "left" }
                    : styles.tableCellDev
                  : firstColumnWidth && idx === 0
                  ? { ...styles.tableCellWide, width: firstColumnWidth }
                  : styles.tableCell
              }
            >
              {row[col.dataIndex] ?? "-"}
            </Text>
          ))}
        </View>
      );
    })}
  </View>
);

const formatItemsWithDev = (items: number, devItems: number): string => {
  if (devItems > 0) {
    return `${items} / ${devItems}`;
  }
  return `${items}`;
};

// Componente para una sucursal completa - todo en una página
const BranchPage = ({ title, data, includeOrderQuantity, timePeriod, grandTotalPrendas, grandTotalDevoluciones }: any) => {
  return (
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{timePeriod}</Text>
      </View>

      <View style={styles.branchSection}>
        <Text style={styles.branchTitle}>{title}</Text>

        {/* Prendas por semana (Venta local) */}
        <Text style={styles.sectionLabel}>Prendas por semana (Venta local)</Text>
        {(() => {
          const columns: Column[] = data.byItemWeek.employees.map((e: any) => ({
            title: e.employee,
            dataIndex: e.employee,
          }));

          const dataRows = (() => {
            const allWeeks = [
              ...new Set(
                data.byItemWeek.employees.flatMap((e: any) =>
                  e.data.map((d: any) => d.week)
                )
              ),
            ].sort((a: any, b: any) => a - b);

            return allWeeks.map((week: any) => {
              const weekdaysLabel =
                data.byItemWeek.employees
                  .flatMap((e: any) => e.data)
                  .find((d: any) => d.week === week)?.weekdays ||
                `Semana ${week}`;

              const row: Record<string, any> = { label: weekdaysLabel };

              for (const emp of data.byItemWeek.employees) {
                const match = emp.data.find((d: any) => d.week === week);
                if (match) {
                  row[emp.employee] = formatItemsWithDev(
                    match.items ?? 0,
                    match.devolutionItems ?? 0
                  );
                } else {
                  row[emp.employee] = "-";
                }
              }
              return row;
            });
          })();

          const totalRow: Record<string, any> = { label: "Total:" };
          for (const emp of data.byItemWeek.employees) {
            const totalItems = emp.data.reduce(
              (sum: number, d: any) => sum + (d.items ?? 0),
              0
            );
            const totalDev = emp.data.reduce(
              (sum: number, d: any) => sum + (d.devolutionItems ?? 0),
              0
            );
            totalRow[emp.employee] = formatItemsWithDev(totalItems, totalDev);
          }

          return (
            <Table
              columns={[{ title: "Semana", dataIndex: "label" }, ...columns]}
              data={[...dataRows, totalRow]}
              firstColumnWidth={65}
            />
          );
        })()}

        <Text style={styles.totalLine}>
          <Text style={styles.totalLineValue}>Total: {data.byItemWeek.totalItems}</Text>
          {data.byItemWeek.totalDevolutionItems > 0 && (
            <Text style={styles.totalLineDev}> / {data.byItemWeek.totalDevolutionItems}</Text>
          )}
        </Text>

        <View style={styles.divider} />

        {/* Cantidad de pedidos */}
        {includeOrderQuantity && (
          <>
            <Text style={styles.sectionLabel}>Cantidad de pedidos</Text>
            {(() => {
              const columns = data.byQuantitySalePedido.employees.map((e: any) => ({
                title: e.employee,
                dataIndex: e.employee,
              }));
              const row: Record<string, any> = Object.fromEntries(
                data.byQuantitySalePedido.employees.map((e: any) => [
                  e.employee,
                  e.data[0]?.quantity || 0,
                ])
              );
              return <Table columns={columns} data={[row]} />;
            })()}
            <Text style={styles.totalLine}>
              <Text style={styles.totalLineValue}>Total: {data.byQuantitySalePedido.totalItems}</Text>
            </Text>
            <View style={styles.divider} />
          </>
        )}

        {/* Prendas por concepto */}
        <Text style={styles.sectionLabel}>Prendas por concepto</Text>
        {(() => {
          const columns: Column[] = data.byItemConceptEmployee.employees.map((e: any) => ({
            title: e.employee,
            dataIndex: e.employee,
          }));

          const concepts = [
            "Venta local",
            "Pedido (Retira local)",
            "Pedido (Envio)",
          ];

          const rows = concepts.map((concept) => {
            const row: Record<string, any> = { label: concept };
            for (const emp of data.byItemConceptEmployee.employees) {
              const match = emp.data.find((d: any) => d.concept === concept);
              if (match) {
                row[emp.employee] = formatItemsWithDev(
                  match.items ?? 0,
                  match.devolutionItems ?? 0
                );
              } else {
                row[emp.employee] = "-";
              }
            }
            return row;
          });

          const totalRow: Record<string, any> = { label: "Total:" };
          for (const emp of data.byItemConceptEmployee.employees) {
            const totalItems = emp.data.reduce(
              (sum: number, d: any) => sum + (d.items ?? 0),
              0
            );
            const totalDev = emp.data.reduce(
              (sum: number, d: any) => sum + (d.devolutionItems ?? 0),
              0
            );
            totalRow[emp.employee] = formatItemsWithDev(totalItems, totalDev);
          }

          return (
            <Table
              columns={[{ title: "Concepto", dataIndex: "label" }, ...columns]}
              data={[...rows, totalRow]}
              firstColumnWidth={85}
            />
          );
        })()}

        <Text style={styles.totalLine}>
          <Text style={styles.totalLineValue}>Total: {data.byItemConceptEmployee.totalItems}</Text>
          {data.byItemConceptEmployee.totalDevolutionItems > 0 && (
            <Text style={styles.totalLineDev}> / {data.byItemConceptEmployee.totalDevolutionItems}</Text>
          )}
        </Text>

        <View style={styles.divider} />

        {/* Resumen por concepto */}
        <Text style={styles.sectionLabel}>Resumen por concepto</Text>
        <Table
          columns={[
            { title: "Concepto", dataIndex: "concept" },
            { title: "Prendas", dataIndex: "items" },
            { title: "Dev", dataIndex: "devolutionItems", isDevolution: true },
          ]}
          data={[
            ...data.byItemConcept.concepts.map((c: any) => ({
              concept: c.concept,
              items: c.items,
              devolutionItems: c.devolutionItems || 0,
            })),
            {
              concept: "Total:",
              items: data.byItemConcept.totalItems,
              devolutionItems: data.byItemConcept.totalDevolutionItems || 0,
            },
          ]}
          firstColumnWidth={85}
        />
      </View>

      {/* Grand Total */}
      <Text style={styles.grandTotal}>
        Total de Prendas (Bogotá y Helguera): {grandTotalPrendas}
        {grandTotalDevoluciones > 0 && (
          <Text style={styles.grandTotalDev}> / {grandTotalDevoluciones}</Text>
        )}
      </Text>
    </Page>
  );
};

type PdfReportProps = {
  dataBogota: any;
  dataHelguera: any;
  timePeriod: any;
};

const PdfReportByEmployee = ({
  dataBogota,
  dataHelguera,
  timePeriod,
}: PdfReportProps) => {
  const totalPrendas =
    dataBogota.byItemConcept.totalItems + dataHelguera.byItemConcept.totalItems;
  const totalDevoluciones =
    (dataBogota.byItemConcept.totalDevolutionItems || 0) +
    (dataHelguera.byItemConcept.totalDevolutionItems || 0);

  return (
    <Document>
      {/* Página 1: BOGOTÁ */}
      <BranchPage
        title="BOGOTÁ"
        data={dataBogota}
        includeOrderQuantity={true}
        timePeriod={timePeriod}
        grandTotalPrendas={totalPrendas}
        grandTotalDevoluciones={totalDevoluciones}
      />

      {/* Página 2: HELGUERA */}
      <BranchPage
        title="HELGUERA"
        data={dataHelguera}
        includeOrderQuantity={true}
        timePeriod={timePeriod}
        grandTotalPrendas={totalPrendas}
        grandTotalDevoluciones={totalDevoluciones}
      />
    </Document>
  );
};

export default PdfReportByEmployee;
