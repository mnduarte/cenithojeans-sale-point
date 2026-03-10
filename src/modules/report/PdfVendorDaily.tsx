import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const colors = {
  primary: "#1a365d",
  headerBg: "#edf2f7",
  border: "#cbd5e0",
  text: "#1a202c",
  textLight: "#718096",
  devolution: "#c53030",
  totalBg: "#ebf8ff",
  grandTotalBg: "#bee3f8",
  white: "#ffffff",
  vendorBg: "#e6f0fd",
  vendorBgAlt: "#dbeafe",
};

const styles = StyleSheet.create({
  page: { padding: 16, fontFamily: "Helvetica", backgroundColor: colors.white },
  header: {
    marginBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerTitle: { fontSize: 12, fontWeight: "bold", color: colors.primary },
  headerSub: { fontSize: 8, color: colors.textLight },
  table: { width: "auto" },
  row: { flexDirection: "row" },
  // header cell for day columns — 2 lines
  cellHeader: {
    fontWeight: "bold",
    paddingVertical: 2,
    paddingHorizontal: 1,
    borderWidth: 0.5,
    borderColor: colors.border,
    textAlign: "center",
    backgroundColor: colors.headerBg,
    color: colors.primary,
  },
  cellVendor: {
    fontSize: 7,
    fontWeight: "bold",
    paddingVertical: 3,
    paddingHorizontal: 3,
    borderWidth: 0.5,
    borderColor: colors.border,
    textAlign: "left",
    color: colors.primary,
    justifyContent: "center",
  },
  cellTipo: {
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderWidth: 0.5,
    borderColor: colors.border,
    textAlign: "center",
    justifyContent: "center",
  },
  cellData: {
    paddingVertical: 2,
    paddingHorizontal: 1,
    borderWidth: 0.5,
    borderColor: colors.border,
    textAlign: "center",
    justifyContent: "center",
  },
  cellTotal: {
    fontWeight: "bold",
    paddingVertical: 2,
    paddingHorizontal: 1,
    borderWidth: 0.5,
    borderColor: colors.border,
    textAlign: "center",
    backgroundColor: colors.totalBg,
    justifyContent: "center",
  },
  cellGrandTotal: {
    fontWeight: "bold",
    paddingVertical: 2,
    paddingHorizontal: 1,
    borderWidth: 0.5,
    borderColor: colors.border,
    textAlign: "center",
    backgroundColor: colors.grandTotalBg,
    justifyContent: "center",
  },
  devText: { color: colors.devolution },
  normalText: { color: colors.text },
  lightText: { color: colors.textLight },
});

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const getDayName = (dateStr: string, year: number): string => {
  const [dd, mm] = dateStr.split("/");
  const d = new Date(year, parseInt(mm) - 1, parseInt(dd));
  return DAY_NAMES[d.getDay()];
};

type DayData = { jeans: number; remeras: number; devJeans: number; devRemeras: number };
type Employee = {
  name: string;
  store: string;
  days: Record<string, DayData>;
  subtotals: { jeans: number; remeras: number; devJeans: number; devRemeras: number };
};

type Props = {
  dates: string[];
  employees: Employee[];
  dailyTotals: Record<string, DayData>;
  grandTotals: { jeans: number; remeras: number; devJeans: number; devRemeras: number };
  storeName: string;
  timePeriod: string;
  year: number;
};

const PdfVendorDaily = ({ dates, employees, dailyTotals, grandTotals, storeName, timePeriod, year }: Props) => {
  // Compute dynamic column widths to fill landscape A4 (~810pt usable)
  const COL_VENDOR = 58;
  const COL_TIPO = 38;
  const COL_TOTAL = 36;
  const remaining = 810 - COL_VENDOR - COL_TIPO - COL_TOTAL;
  const COL_DAY = Math.max(28, Math.min(52, Math.floor(remaining / dates.length)));

  const FS = dates.length > 10 ? 6 : 7; // smaller font if many columns

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Listado Vendedor — {storeName}</Text>
          <Text style={styles.headerSub}>{timePeriod}</Text>
        </View>

        <View style={styles.table}>
          {/* Header row */}
          <View style={styles.row}>
            <Text style={[styles.cellHeader, { width: COL_VENDOR, fontSize: FS, textAlign: "left", paddingHorizontal: 3 }]}>Vendedor</Text>
            <Text style={[styles.cellHeader, { width: COL_TIPO, fontSize: FS }]}>Tipo</Text>
            {dates.map((d) => (
              <View key={d} style={[styles.cellHeader, { width: COL_DAY }]}>
                <Text style={{ fontSize: FS - 1, fontWeight: "bold", color: colors.textLight, textAlign: "center" }}>
                  {getDayName(d, year)}
                </Text>
                <Text style={{ fontSize: FS, fontWeight: "bold", color: colors.primary, textAlign: "center" }}>
                  {d}
                </Text>
              </View>
            ))}
            <Text style={[styles.cellHeader, { width: COL_TOTAL, fontSize: FS }]}>Total</Text>
          </View>

          {/* Employee rows — 2 per employee */}
          {employees.map((emp, i) => {
            const bg = i % 2 === 0 ? colors.vendorBg : colors.vendorBgAlt;
            return (
              <View key={emp.name}>
                {/* Jeans / Dev Jeans row */}
                <View style={styles.row}>
                  <View style={[styles.cellVendor, { width: COL_VENDOR, backgroundColor: bg }]}>
                    <Text style={{ fontSize: FS }}>{emp.name}</Text>
                    <Text style={{ fontSize: FS - 1, color: colors.textLight }}>{emp.store}</Text>
                  </View>
                  <View style={[styles.cellTipo, { width: COL_TIPO }]}>
                    <Text style={{ fontSize: FS, color: colors.text }}>Jeans</Text>
                    <Text style={{ fontSize: FS - 1, color: colors.devolution }}>Dev Jeans</Text>
                  </View>
                  {dates.map((d) => {
                    const day = emp.days[d];
                    return (
                      <View key={d} style={[styles.cellData, { width: COL_DAY }]}>
                        <Text style={{ fontSize: FS, color: colors.text, textAlign: "center" }}>
                          {day?.jeans || "-"}
                        </Text>
                        <Text style={{ fontSize: FS - 1, color: colors.devolution, textAlign: "center" }}>
                          {day?.devJeans ? `-${day.devJeans}` : "-"}
                        </Text>
                      </View>
                    );
                  })}
                  <View style={[styles.cellTotal, { width: COL_TOTAL }]}>
                    <Text style={{ fontSize: FS, color: colors.primary, textAlign: "center" }}>
                      {emp.subtotals.jeans || "-"}
                    </Text>
                    <Text style={{ fontSize: FS - 1, color: colors.devolution, textAlign: "center" }}>
                      {emp.subtotals.devJeans ? `-${emp.subtotals.devJeans}` : "-"}
                    </Text>
                  </View>
                </View>

                {/* Rem / Dev Rem row */}
                <View style={styles.row}>
                  <View style={[styles.cellVendor, { width: COL_VENDOR, backgroundColor: bg }]} />
                  <View style={[styles.cellTipo, { width: COL_TIPO }]}>
                    <Text style={{ fontSize: FS, color: colors.text }}>Rem</Text>
                    <Text style={{ fontSize: FS - 1, color: colors.devolution }}>Dev Rem</Text>
                  </View>
                  {dates.map((d) => {
                    const day = emp.days[d];
                    return (
                      <View key={d} style={[styles.cellData, { width: COL_DAY }]}>
                        <Text style={{ fontSize: FS, color: colors.text, textAlign: "center" }}>
                          {day?.remeras || "-"}
                        </Text>
                        <Text style={{ fontSize: FS - 1, color: colors.devolution, textAlign: "center" }}>
                          {day?.devRemeras ? `-${day.devRemeras}` : "-"}
                        </Text>
                      </View>
                    );
                  })}
                  <View style={[styles.cellTotal, { width: COL_TOTAL }]}>
                    <Text style={{ fontSize: FS, color: colors.primary, textAlign: "center" }}>
                      {emp.subtotals.remeras || "-"}
                    </Text>
                    <Text style={{ fontSize: FS - 1, color: colors.devolution, textAlign: "center" }}>
                      {emp.subtotals.devRemeras ? `-${emp.subtotals.devRemeras}` : "-"}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}

          {/* Grand total — 2 rows */}
          <View style={styles.row}>
            <View style={[styles.cellGrandTotal, { width: COL_VENDOR, justifyContent: "center" }]}>
              <Text style={{ fontSize: FS, textAlign: "left", paddingHorizontal: 3 }}>TOTAL</Text>
            </View>
            <View style={[styles.cellGrandTotal, { width: COL_TIPO }]}>
              <Text style={{ fontSize: FS, textAlign: "center" }}>Jeans</Text>
              <Text style={{ fontSize: FS - 1, color: colors.devolution, textAlign: "center" }}>Dev Jeans</Text>
            </View>
            {dates.map((d) => (
              <View key={d} style={[styles.cellGrandTotal, { width: COL_DAY }]}>
                <Text style={{ fontSize: FS, textAlign: "center" }}>{dailyTotals[d]?.jeans || "-"}</Text>
                <Text style={{ fontSize: FS - 1, color: colors.devolution, textAlign: "center" }}>
                  {dailyTotals[d]?.devJeans || "-"}
                </Text>
              </View>
            ))}
            <View style={[styles.cellGrandTotal, { width: COL_TOTAL }]}>
              <Text style={{ fontSize: FS, textAlign: "center" }}>{grandTotals.jeans}</Text>
              <Text style={{ fontSize: FS - 1, color: colors.devolution, textAlign: "center" }}>
                {grandTotals.devJeans || "-"}
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={[styles.cellGrandTotal, { width: COL_VENDOR }]} />
            <View style={[styles.cellGrandTotal, { width: COL_TIPO }]}>
              <Text style={{ fontSize: FS, textAlign: "center" }}>Rem</Text>
              <Text style={{ fontSize: FS - 1, color: colors.devolution, textAlign: "center" }}>Dev Rem</Text>
            </View>
            {dates.map((d) => (
              <View key={d} style={[styles.cellGrandTotal, { width: COL_DAY }]}>
                <Text style={{ fontSize: FS, textAlign: "center" }}>{dailyTotals[d]?.remeras || "-"}</Text>
                <Text style={{ fontSize: FS - 1, color: colors.devolution, textAlign: "center" }}>
                  {dailyTotals[d]?.devRemeras || "-"}
                </Text>
              </View>
            ))}
            <View style={[styles.cellGrandTotal, { width: COL_TOTAL }]}>
              <Text style={{ fontSize: FS, textAlign: "center" }}>{grandTotals.remeras}</Text>
              <Text style={{ fontSize: FS - 1, color: colors.devolution, textAlign: "center" }}>
                {grandTotals.devRemeras || "-"}
              </Text>
            </View>
          </View>
        </View>

        <Text style={{ fontSize: 8, color: colors.primary, marginTop: 8, fontWeight: "bold" }}>
          Total general: {grandTotals.jeans + grandTotals.remeras} prendas
          {(grandTotals.devJeans + grandTotals.devRemeras) > 0
            ? ` / ${grandTotals.devJeans + grandTotals.devRemeras} devoluciones`
            : ""}
        </Text>
      </Page>
    </Document>
  );
};

export default PdfVendorDaily;
