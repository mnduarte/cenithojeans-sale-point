import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency } from "../../utils/formatUtils";

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
    width: 360, // Aumentado para incluir columna de devoluciones
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: 2,
  },
  tableDetail: {
    display: "flex",
    width: 110, // Aumentado para devoluciones
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: 2,
    marginTop: 10,
  },
  tableDetailWithDate: {
    display: "flex",
    width: 160, // Aumentado para devoluciones
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: 2,
    marginTop: 10,
  },

  tableDetailPedido: {
    display: "flex",
    width: 196, // Aumentado para devoluciones
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: 2,
    marginTop: 10,
  },
  tableDetailWithDatePedido: {
    display: "flex",
    width: 246, // Aumentado para devoluciones
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: 2,
    marginTop: 10,
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
  tableColDev: {
    width: 30,
    borderStyle: "solid",
    border: 0.5,
  },
  tableColHeader: {
    width: 110, // Aumentado para devoluciones
    borderStyle: "solid",
    borderWidth: 0.5,
    borderLeftWidth: 0.5,
    borderTopWidth: 0.5,
  },
  tableColHeaderPedido: {
    width: 196, // Aumentado para devoluciones
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
  tableColDevSmall: {
    width: 24,
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
  textDev: {
    fontSize: 8,
    textAlign: "center",
    color: "#dc2626",
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
        <View style={styles.tableColDevSmall}>
          <Text style={styles.textDev}>Dev</Text>
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
          <View style={styles.tableColDevSmall}>
            <Text style={styles.textDev}>{row.devolutionItems || 0}</Text>
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
        <View style={styles.tableColDevSmall}>
          <Text style={styles.textResume}>
            {data.reduce(
              (acc: any, current: any) => acc + (current.devolutionItems || 0),
              0
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
        <View style={styles.tableColDevSmall}>
          <Text style={styles.textDev}>Dev</Text>
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
          <View style={styles.tableColDevSmall}>
            <Text style={styles.textDev}>{row.devolutionItems || 0}</Text>
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
        <View style={styles.tableColDevSmall}>
          <Text style={styles.textResume}>
            {data.reduce(
              (acc: any, current: any) => acc + (current.devolutionItems || 0),
              0
            )}
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
        <View style={styles.tableColDev}>
          <Text style={styles.textDev}>Dev</Text>
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
      {data.map((resume: any, index: number) => (
        <View key={index} style={[styles.tableRow]}>
          <View style={styles.tableCol}>
            <Text style={styles.text}>{resume.date}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.text}>{resume.items}</Text>
          </View>
          <View style={styles.tableColDev}>
            <Text style={styles.textDev}>{resume.devolutionItems || 0}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.text}>
              ${formatCurrency(resume.outgoings || 0)}
            </Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.text}>${formatCurrency(resume.cash || 0)}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.text}>
              ${formatCurrency(resume.totalBox || 0)}
            </Text>
          </View>
        </View>
      ))}
      <View style={[styles.tableRow]}>
        <View style={styles.tableCol}>
          <Text style={styles.textResume}></Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.textResume}>
            {data.reduce(
              (acc: any, current: any) => acc + current.items || 0,
              0
            )}
          </Text>
        </View>
        <View style={styles.tableColDev}>
          <Text style={styles.textResume}>
            {data.reduce(
              (acc: any, current: any) => acc + (current.devolutionItems || 0),
              0
            )}
          </Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.textResume}>
            $
            {formatCurrency(
              data.reduce(
                (acc: any, current: any) => acc + current.outgoings || 0,
                0
              )
            )}
          </Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.textResume}>
            $
            {formatCurrency(
              data.reduce(
                (acc: any, current: any) => acc + current.cash || 0,
                0
              )
            )}
          </Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.textResume}>
            $
            {formatCurrency(
              data.reduce(
                (acc: any, current: any) => acc + current.totalBox || 0,
                0
              )
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
      {data.map((resume: any, index: number) => (
        <View key={index} style={[styles.tableRow]}>
          <View style={styles.tableCol}>
            <Text style={styles.text}>{resume.date}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.text}>{resume.items}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.text}>${formatCurrency(resume.cash || 0)}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.text}>
              ${formatCurrency(resume.transfer || 0)}
            </Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.text}>
              ${formatCurrency(resume.total || 0)}
            </Text>
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
            {data.reduce(
              (acc: any, current: any) => acc + current.items || 0,
              0
            )}
          </Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.textResume}>
            $
            {formatCurrency(
              data.reduce(
                (acc: any, current: any) => acc + current.cash || 0,
                0
              )
            )}
          </Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.textResume}>
            $
            {formatCurrency(
              data.reduce(
                (acc: any, current: any) => acc + current.transfer || 0,
                0
              )
            )}
          </Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.textResume}>
            $
            {formatCurrency(
              data.reduce(
                (acc: any, current: any) => acc + current.total || 0,
                0
              )
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
                  key={idx}
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
