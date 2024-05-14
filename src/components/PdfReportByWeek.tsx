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
    width: 300,
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
    fontSize: 8,
    textAlign: "center",
  },
  textResume: {
    fontSize: 8,
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

const TableByEmployeeByType: any = {
  local: ({ headerTitle, data, showDate }: any) => (
    <View style={showDate ? styles.tableDetailWithDate : styles.tableDetail}>
      {/* Table Header */}
      <View style={styles.tableRow}>
        {showDate && (
          <View style={styles.tableColDate}>
            <Text style={styles.text}></Text>
          </View>
        )}
        <View style={styles.tableColHeader}>
          <Text style={styles.text}>{headerTitle}</Text>
        </View>
      </View>

      <View style={[styles.tableRow]}>
        {showDate && (
          <View style={styles.tableColDate}>
            <Text style={styles.text}>Fecha</Text>
          </View>
        )}
        <View style={styles.tableColItem}>
          <Text style={styles.text}>Prendas</Text>
        </View>
        <View style={styles.tableColTotal}>
          <Text style={styles.text}>Venta</Text>
        </View>
      </View>

      {/* Table Body */}
      {data.map((row: any, index: any) => (
        <View key={index} style={[styles.tableRow]}>
          {showDate && (
            <View style={styles.tableColDate}>
              <Text style={styles.text}>{row.date}</Text>
            </View>
          )}
          <View style={styles.tableColItem}>
            <Text style={styles.text}>{row.items}</Text>
          </View>
          <View style={styles.tableColTotal}>
            <Text style={styles.text}>${formatCurrency(row.total)}</Text>
          </View>
        </View>
      ))}
      <View style={[styles.tableRow]}>
        {showDate && (
          <View style={styles.tableColDate}>
            <Text style={styles.text}></Text>
          </View>
        )}
        <View style={styles.tableColItem}>
          <Text style={styles.textResume}>
            {data.reduce((acc: any, current: any) => acc + current.items, 0)}
          </Text>
        </View>
        <View style={styles.tableColTotal}>
          <Text style={styles.textResume}>
            $
            {formatCurrency(
              data.reduce((acc: any, current: any) => acc + current.total, 0)
            )}
          </Text>
        </View>
      </View>
    </View>
  ),
  pedido: ({ headerTitle, data, showDate }: any) => (
    <View
      style={
        showDate ? styles.tableDetailWithDatePedido : styles.tableDetailPedido
      }
    >
      {/* Table Header */}
      <View style={styles.tableRow}>
        {showDate && (
          <View style={styles.tableColDate}>
            <Text style={styles.text}></Text>
          </View>
        )}
        <View style={styles.tableColHeaderPedido}>
          <Text style={styles.text}>{headerTitle}</Text>
        </View>
      </View>

      <View style={[styles.tableRow]}>
        {showDate && (
          <View style={styles.tableColDate}>
            <Text style={styles.text}>Fecha</Text>
          </View>
        )}
        <View style={styles.tableColItem}>
          <Text style={styles.text}>Prendas</Text>
        </View>
        <View style={styles.tableColTotal}>
          <Text style={styles.text}>Efecti.</Text>
        </View>
        <View style={styles.tableColTotal}>
          <Text style={styles.text}>Transf</Text>
        </View>
        <View style={styles.tableColTotal}>
          <Text style={styles.text}>Venta</Text>
        </View>
      </View>

      {/* Table Body */}
      {data.map((row: any, index: any) => (
        <View key={index} style={[styles.tableRow]}>
          {showDate && (
            <View style={styles.tableColDate}>
              <Text style={styles.text}>{row.date}</Text>
            </View>
          )}
          <View style={styles.tableColItem}>
            <Text style={styles.text}>{row.items}</Text>
          </View>
          <View style={styles.tableColTotal}>
            <Text style={styles.text}>${formatCurrency(row.cash)}</Text>
          </View>
          <View style={styles.tableColTotal}>
            <Text style={styles.text}>${formatCurrency(row.transfer)}</Text>
          </View>
          <View style={styles.tableColTotal}>
            <Text style={styles.text}>${formatCurrency(row.total)}</Text>
          </View>
        </View>
      ))}
      <View style={[styles.tableRow]}>
        {showDate && (
          <View style={styles.tableColDate}>
            <Text style={styles.text}></Text>
          </View>
        )}
        <View style={styles.tableColItem}>
          <Text style={styles.textResume}>
            {data.reduce((acc: any, current: any) => acc + current.items, 0)}
          </Text>
        </View>
        <View style={styles.tableColTotal}>
          <Text style={styles.textResume}>
            $
            {formatCurrency(
              data.reduce((acc: any, current: any) => acc + current.cash, 0)
            )}
          </Text>
        </View>
        <View style={styles.tableColTotal}>
          <Text style={styles.textResume}>
            $
            {formatCurrency(
              data.reduce((acc: any, current: any) => acc + current.transfer, 0)
            )}
          </Text>
        </View>
        <View style={styles.tableColTotal}>
          <Text style={styles.textResume}>
            $
            {formatCurrency(
              data.reduce((acc: any, current: any) => acc + current.total, 0)
            )}
          </Text>
        </View>
      </View>
    </View>
  ),
};

const TableByType: any = {
  local: ({ data }: any) => (
    <View style={styles.table}>
      <View style={[styles.tableRow]}>
        <View style={styles.tableCol}>
          <Text style={styles.text}>Fecha</Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.text}>Prendas</Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.text}>Gastos</Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.text}>Venta</Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.text}>TotalCaja</Text>
        </View>
      </View>
      {data.map((resume: any) => (
        <View style={[styles.tableRow]}>
          <View style={styles.tableCol}>
            <Text style={styles.text}>{resume.date}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.text}>{resume.items}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.text}>${formatCurrency(resume.outgoings)}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.text}>${formatCurrency(resume.total)}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.text}>${formatCurrency(resume.totalBox)}</Text>
          </View>
        </View>
      ))}
      <View style={[styles.tableRow]}>
        <View style={styles.tableCol}>
          <Text style={styles.textResume}></Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.textResume}>
            {data.reduce((acc: any, current: any) => acc + current.items, 0)}
          </Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.textResume}>
            $
            {formatCurrency(
              data.reduce(
                (acc: any, current: any) => acc + current.outgoings,
                0
              )
            )}
          </Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.textResume}>
            $
            {formatCurrency(
              data.reduce((acc: any, current: any) => acc + current.total, 0)
            )}
          </Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.textResume}>
            $
            {formatCurrency(
              data.reduce((acc: any, current: any) => acc + current.totalBox, 0)
            )}
          </Text>
        </View>
      </View>
    </View>
  ),
  pedido: ({ data }: any) => (
    <View style={styles.table}>
      <View style={[styles.tableRow]}>
        <View style={styles.tableCol}>
          <Text style={styles.text}>Fecha</Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.text}>Prendas</Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.text}>Efectivo</Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.text}>Transfer</Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.text}>Total</Text>
        </View>
      </View>
      {data.map((resume: any) => (
        <View style={[styles.tableRow]}>
          <View style={styles.tableCol}>
            <Text style={styles.text}>{resume.date}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.text}>{resume.items}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.text}>${formatCurrency(resume.cash)}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.text}>${formatCurrency(resume.transfer)}</Text>
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
          <Text style={styles.textResume}>
            {" "}
            {data.reduce((acc: any, current: any) => acc + current.items, 0)}
          </Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.textResume}>
            $
            {formatCurrency(
              data.reduce((acc: any, current: any) => acc + current.cash, 0)
            )}
          </Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.textResume}>
            $
            {formatCurrency(
              data.reduce((acc: any, current: any) => acc + current.transfer, 0)
            )}
          </Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.textResume}>
            $
            {formatCurrency(
              data.reduce((acc: any, current: any) => acc + current.total, 0)
            )}
          </Text>
        </View>
      </View>
    </View>
  ),
};

const PdfReportByWeek = ({
  week,
  store,
  type,
  dataWeek,
  salesByEmployees,
}: any) => {
  const GeneralTable = TableByType[type];
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.title}>
          <Text>
            Semana: {week} Sucursal: {store} - {type}
          </Text>
        </View>
        <GeneralTable data={dataWeek} />
        <View style={styles.row}>
          {Object.entries(salesByEmployees).map(
            (saleByEmployee: any, idx: number) => {
              const GeneralTableByEmployee = TableByEmployeeByType[type];
              const [_, sale] = saleByEmployee;
              return (
                <GeneralTableByEmployee
                  headerTitle={sale.employee}
                  data={sale.sales}
                  showDate={idx === 0}
                />
              );
            }
          )}
        </View>
      </Page>
    </Document>
  );
};

export default PdfReportByWeek;
