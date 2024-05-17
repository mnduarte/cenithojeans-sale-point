import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency } from "../utils/formatUtils";

const styles = StyleSheet.create({
  page: {
    padding: 10,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  table: {
    display: "flex",
    width: 90,
    flexDirection: "row", // Cambiado para disposición horizontal
    flexWrap: "wrap", // Para que se envuelvan los elementos si no caben en una sola fila
    marginLeft: 2, // Margen inferior para separar las tablas
    marginBottom: 10
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableColHeader: {
    width: 90,
    borderStyle: "solid",
    borderWidth: 0.5,
    borderLeftWidth: 0.5,
    borderTopWidth: 0.5,
  },
  tableColOrder: {
    color: "#FF0000",
    width: 26,
    borderStyle: "solid",
    borderWidth: 0.5,
    borderLeftWidth: 0.5,
    borderTopWidth: 0,
  },
  tableColItem: {
    width: 18,
    borderStyle: "solid",
    borderWidth: 0.5,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableColCash: {
    width: 46,
    borderStyle: "solid",
    borderWidth: 0.5,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  text: {
    fontSize: 8,
    textAlign: "center",
  },
  title: {
    fontSize: 10,
    marginBottom: 5,
    marginTop: 8,
  },
  ingresoCell: {
    backgroundColor: "#F2CDCB",
  },
});

const TablePdf = ({ headerTitle, data }: any) => (
  <View style={styles.table}>
    {/* Table Header */}
    <View style={styles.tableRow}>
      <View style={styles.tableColHeader}>
        <Text style={styles.text}>{headerTitle}</Text>
      </View>
    </View>

    {/* Table Body */}
    {data.map((row: any, index: any) => (
      <View
        key={index}
        style={[styles.tableRow, row.type === "ingreso" && styles.ingresoCell]}
      >
        <View style={styles.tableColOrder}>
          <Text style={styles.text}>{row.order}</Text>
        </View>
        <View style={styles.tableColItem}>
          <Text style={styles.text}>{row.items}</Text>
        </View>
        <View style={styles.tableColCash}>
          <Text style={styles.text}>
            {row.cash === 0 ? "MP" : "$" + formatCurrency(row.cash)}
          </Text>
        </View>
      </View>
    ))}
    <View style={[styles.tableRow]}>
      <View style={styles.tableColOrder}>
        <Text style={styles.text}></Text>
      </View>
      <View style={styles.tableColItem}>
        <Text style={styles.text}>
          {data.reduce((acc: any, current: any) => acc + current.items, 0)}
        </Text>
      </View>
      <View style={styles.tableColCash}>
        <Text style={styles.text}></Text>
      </View>
    </View>
  </View>
);

const PdfLocalSale = ({
  salesByEmployees,
  date,
  store,
  totalItemsSold,
}: any) => {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.title}>
          <Text>
            Fecha: {date} Sucursal: {store}
          </Text>
        </View>
        <View style={styles.row}>
          {Object.entries(salesByEmployees).map(
            (saleByEmployee: any, idx: number) => {
              const [emp, sales] = saleByEmployee;

              return <TablePdf headerTitle={emp} data={sales} />;
            }
          )}
        </View>
        <View style={styles.title}>
          <Text>Prendas Vendidas: {totalItemsSold}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default PdfLocalSale;
