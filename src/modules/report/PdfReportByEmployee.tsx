import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontSize: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderColor: "#999",
    paddingBottom: 2,
  },
  divider: {
    marginBottom: 2,
    borderBottomWidth: 1,
    borderColor: "#d1d1d1",
    paddingBottom: 2,
  },
  subtitle: {
    fontSize: 8,
    marginTop: 4,
    marginBottom: 2,
  },
  row: {
    flexDirection: "row",
  },
  table: {
    width: "auto",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    padding: 2,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#999",
    textAlign: "center",
    width: 50,
  },
  tableCellDev: {
    padding: 2,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#999",
    textAlign: "center",
    width: 50,
    color: "#dc2626",
  },
  tableHeader: {
    fontWeight: "bold",
    backgroundColor: "#eee",
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
  <View style={styles.table}>
    <View style={styles.tableRow}>
      {columns.map((col, idx) => (
        <Text
          key={idx}
          style={[
            col.isDevolution
              ? {
                  ...styles.tableCellDev,
                  width:
                    firstColumnWidth && idx === 0
                      ? firstColumnWidth
                      : styles.tableCell.width,
                }
              : {
                  ...styles.tableCell,
                  width:
                    firstColumnWidth && idx === 0
                      ? firstColumnWidth
                      : styles.tableCell.width,
                },
            styles.tableHeader,
          ]}
        >
          {col.title}
        </Text>
      ))}
    </View>
    {data.map((row, i) => (
      <View key={i} style={styles.tableRow}>
        {columns.map((col, idx) => (
          <Text
            key={idx}
            style={
              col.isDevolution
                ? {
                    ...styles.tableCellDev,
                    width:
                      firstColumnWidth && idx === 0
                        ? firstColumnWidth
                        : styles.tableCell.width,
                    textAlign: firstColumnWidth && idx === 0 ? "left" : "center",
                  }
                : {
                    ...styles.tableCell,
                    width:
                      firstColumnWidth && idx === 0
                        ? firstColumnWidth
                        : styles.tableCell.width,
                    textAlign: firstColumnWidth && idx === 0 ? "left" : "center",
                  }
            }
          >
            {row[col.dataIndex] ?? "-"}
          </Text>
        ))}
      </View>
    ))}
  </View>
);

// Helper para formatear items con devoluciones: "items / dev" (dev en rojo)
const formatItemsWithDev = (items: number, devItems: number): string => {
  if (devItems > 0) {
    return `${items} / ${devItems}`;
  }
  return `${items}`;
};

const PdfSectionByBranch = ({ title, data, includeOrderQuantity }: any) => {
  const totalColumn = (rows: any[], keys: string[]) => {
    const row: Record<string, any> = { label: "Total:" };
    for (const key of keys) {
      row[key] = rows.reduce((sum, r) => sum + (parseInt(r[key]) || 0), 0);
    }
    return row;
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>

      <Text style={styles.subtitle}>Prendas por semana (Venta local):</Text>
      {(() => {
        // Crear columnas con items/dev combinados
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

        // Calcular totales
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
            firstColumnWidth={70}
          />
        );
      })()}

      <Text style={styles.subtitle}>
        Total: {data.byItemWeek.totalItems}
        {data.byItemWeek.totalDevolutionItems > 0 &&
          ` / ${data.byItemWeek.totalDevolutionItems}`}
      </Text>
      <Text style={styles.divider}></Text>

      {includeOrderQuantity && (
        <>
          <Text style={styles.subtitle}>Cantidad de pedidos:</Text>
          {(() => {
            const columns = data.byQuantitySalePedido.employees.map(
              (e: any) => ({
                title: e.employee,
                dataIndex: e.employee,
              })
            );
            const row: Record<string, any> = Object.fromEntries(
              data.byQuantitySalePedido.employees.map((e: any) => [
                e.employee,
                e.data[0]?.quantity || 0,
              ])
            );
            return <Table columns={columns} data={[row]} />;
          })()}

          <Text style={styles.subtitle}>
            Total: {data.byQuantitySalePedido.totalItems}
          </Text>
          <Text style={styles.divider}></Text>
        </>
      )}

      <Text style={styles.subtitle}>Prendas:</Text>
      {(() => {
        const columns: Column[] = data.byItemConceptEmployee.employees.map(
          (e: any) => ({
            title: e.employee,
            dataIndex: e.employee,
          })
        );

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

        // Calcular totales por empleado
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
          <>
            <Table
              columns={[{ title: "Concepto", dataIndex: "label" }, ...columns]}
              data={[...rows, totalRow]}
              firstColumnWidth={90}
            />

            <Text style={styles.subtitle}>
              Total: {data.byItemConceptEmployee.totalItems}
              {data.byItemConceptEmployee.totalDevolutionItems > 0 &&
                ` / ${data.byItemConceptEmployee.totalDevolutionItems}`}
            </Text>
            <Text style={styles.divider}></Text>
          </>
        );
      })()}

      <Text style={styles.subtitle}>Total por concepto:</Text>
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
        firstColumnWidth={90}
      />
    </View>
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
}: PdfReportProps) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <Text style={styles.sectionTitle}>{timePeriod}</Text>
      <PdfSectionByBranch
        title="BOGOTA"
        data={dataBogota}
        includeOrderQuantity={true}
      />
      <Text style={styles.sectionTitle}>
        Total de Prendas (Bogota y Helguera):{" "}
        {dataBogota.byItemConcept.totalItems +
          dataHelguera.byItemConcept.totalItems}
        {(dataBogota.byItemConcept.totalDevolutionItems || 0) +
          (dataHelguera.byItemConcept.totalDevolutionItems || 0) >
          0 &&
          ` / ${
            (dataBogota.byItemConcept.totalDevolutionItems || 0) +
            (dataHelguera.byItemConcept.totalDevolutionItems || 0)
          }`}
      </Text>
      <Text style={{ height: 80 }}> </Text>
      <Text style={styles.sectionTitle}>{timePeriod}</Text>
      <PdfSectionByBranch
        title="HELGUERA"
        data={dataHelguera}
        includeOrderQuantity={true}
      />
      <Text style={styles.sectionTitle}>
        Total de Prendas (Bogota y Helguera):{" "}
        {dataBogota.byItemConcept.totalItems +
          dataHelguera.byItemConcept.totalItems}
        {(dataBogota.byItemConcept.totalDevolutionItems || 0) +
          (dataHelguera.byItemConcept.totalDevolutionItems || 0) >
          0 &&
          ` / ${
            (dataBogota.byItemConcept.totalDevolutionItems || 0) +
            (dataHelguera.byItemConcept.totalDevolutionItems || 0)
          }`}
      </Text>
    </Page>
  </Document>
);

export default PdfReportByEmployee;
