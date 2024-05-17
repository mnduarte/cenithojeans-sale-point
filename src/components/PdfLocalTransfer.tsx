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
    width: 360,
    flexDirection: "row", // Cambiado para disposición horizontal
    flexWrap: "wrap", // Para que se envuelvan los elementos si no caben en una sola fila
    marginLeft: 2, // Margen inferior para separar las tablas
  },
  tableDetail: {
    display: "flex",
    width: 86,
    flexDirection: "row", // Cambiado para disposición horizontal
    flexWrap: "wrap", // Para que se envuelvan los elementos si no caben en una sola fila
    marginLeft: 2, // Margen inferior para separar las tablas
    marginTop: 10, // Margen inferior para separar las tablas
  },
  tableDetailWithDate: {
    display: "flex",
    width: 136,
    flexDirection: "row", // Cambiado para disposición horizontal
    flexWrap: "wrap", // Para que se envuelvan los elementos si no caben en una sola fila
    marginLeft: 2, // Margen inferior para separar las tablas
    marginTop: 10, // Margen inferior para separar las tablas
  },

  tableDetailPedido: {
    display: "flex",
    width: 172,
    flexDirection: "row", // Cambiado para disposición horizontal
    flexWrap: "wrap", // Para que se envuelvan los elementos si no caben en una sola fila
    marginLeft: 2, // Margen inferior para separar las tablas
    marginTop: 10, // Margen inferior para separar las tablas
  },
  tableDetailWithDatePedido: {
    display: "flex",
    width: 222,
    flexDirection: "row", // Cambiado para disposición horizontal
    flexWrap: "wrap", // Para que se envuelvan los elementos si no caben en una sola fila
    marginLeft: 2, // Margen inferior para separar las tablas
    marginTop: 10, // Margen inferior para separar las tablas
  },

  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableCol: {
    width: 60,
    borderStyle: "solid",
    border: 0.5,
  },
  tableColHeader: {
    width: 86,
    borderStyle: "solid",
    borderWidth: 0.5,
    borderLeftWidth: 0.5,
    borderTopWidth: 0.5,
  },
  tableColHeaderPedido: {
    width: 172,
    borderStyle: "solid",
    borderWidth: 0.5,
    borderLeftWidth: 0.5,
    borderTopWidth: 0.5,
  },
  tableColOrder: {
    color: "#FF0000",
    width: 16,
    borderStyle: "solid",
    borderWidth: 0.5,
    borderLeftWidth: 0.5,
    borderTopWidth: 0,
  },
  tableColDate: {
    width: 50,
    borderStyle: "solid",
    borderWidth: 0.5,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableColItem: {
    width: 38,
    borderStyle: "solid",
    borderWidth: 0.5,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableColTotal: {
    width: 48,
    borderStyle: "solid",
    borderWidth: 0.5,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  text: {
    fontSize: 6,
    textAlign: "center",
  },
  textResume: {
    fontSize: 6,
    color: "#FF0000",
    textAlign: "center",
    fontWeight: "bold",
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

const TableListTranfer = ({ data }: any) => (
  <View style={styles.table}>
    <View style={[styles.tableRow]}>
      <View style={styles.tableCol}>
        <Text style={styles.text}>N°</Text>
      </View>
      <View style={styles.tableCol}>
        <Text style={styles.text}>Vendedor</Text>
      </View>
      <View style={styles.tableCol}>
        <Text style={styles.text}>Efectivo</Text>
      </View>
      <View style={styles.tableCol}>
        <Text style={styles.text}>Transfer</Text>
      </View>
      <View style={styles.tableCol}>
        <Text style={styles.text}>Prendas</Text>
      </View>
      <View style={styles.tableCol}>
        <Text style={styles.text}>Total</Text>
      </View>
    </View>
    {data.map((resume: any) => (
      <View
        style={[
          styles.tableRow,
          resume.type === "ingreso" && styles.ingresoCell,
        ]}
      >
        <View style={styles.tableCol}>
          <Text style={styles.text}>{resume.order}</Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.text}>{resume.employee}</Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.text}>${formatCurrency(resume.cash)}</Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.text}>${formatCurrency(resume.transfer)}</Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.text}>{resume.items}</Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.text}>${formatCurrency(resume.total)}</Text>
        </View>
      </View>
    ))}

    <View style={[styles.tableRow]}>
      <View style={styles.tableCol}>
        <Text style={styles.textResume}></Text>
      </View>
      <View style={styles.tableCol}>
        <Text style={styles.textResume}></Text>
      </View>
      <View style={styles.tableCol}>
        <Text style={styles.textResume}></Text>
      </View>
      <View style={styles.tableCol}>
        <Text style={styles.textResume}></Text>
      </View>
      <View style={styles.tableCol}>
        <Text style={styles.textResume}>
          {data.reduce((acc: any, current: any) => acc + current.items, 0)}
        </Text>
      </View>
      <View style={styles.tableCol}>
        <Text style={styles.textResume}></Text>
      </View>
    </View>
  </View>
);

const PdfLocalTransfer = ({ date, store, data }: any) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.title}>
          <Text>
            Listado de transferencia Fecha {date} Sucursal: {store}
          </Text>
        </View>
        <TableListTranfer data={data} />
      </Page>
    </Document>
  );
};

export default PdfLocalTransfer;
