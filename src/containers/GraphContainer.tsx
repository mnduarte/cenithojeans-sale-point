import { DatePicker, Select } from "antd";
import { formatDateToYYYYMMDD } from "../utils/formatUtils";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useUser } from "../contexts/UserContext";
import dayjs from "dayjs";
import { dateFormat, listStore, mappingListStore } from "../utils/constants";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { graphActions, useGraph } from "../contexts/GraphContext";
import Spinner from "../components/Spinner";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const labels = ["January", "February", "March", "April", "May", "June", "July"];

const getRandomNumber = (min: any, max: any) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const data = {
  labels,
  datasets: [
    {
      label: "Dataset 1",
      data: [100, 200, 0, 300, 50, 500, 700],
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
    {
      label: "Dataset 2",
      //data: labels.map(() => getRandomNumber(-1000, 1000)),
      data: [200, 100, 0, 300, 500, 0, 100],
      borderColor: "rgb(53, 162, 235)",
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    },
  ],
};

const GraphContainer = () => {
  const {
    state: { theme, themeStyles },
  } = useTheme();

  const {
    state: { loading, data },
    dispatch,
  } = useGraph();

  const [filters, setFilters] = useState({
    startDate: formatDateToYYYYMMDD(new Date()),
    endDate: formatDateToYYYYMMDD(new Date()),
    store: "ALL",
  });

  const options = {
    responsive: true,
    scales: {
      x: {
        ticks: {
          color: themeStyles[theme].textColor,
        },
      },
      y: {
        ticks: {
          color: themeStyles[theme].textColor,
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: themeStyles[theme].textColor,
        },
      },
      title: {
        display: true,
        text: "Chart.js Line Chart",
        color: themeStyles[theme].textColor,
      },
    },
  };

  return (
    <>
      <div
        className={`h-12 relative p-2 border-x border-t ${themeStyles[theme].tailwindcss.border} flex justify-center`}
      >
        <div className="inline-block">
          <label className="mr-1">Desde:</label>
          <DatePicker
            onChange={(date: any) =>
              setFilters((props) => ({
                ...props,
                startDate: date.format("YYYY-MM-DD"),
              }))
            }
            className={themeStyles[theme].datePickerIndicator}
            style={themeStyles[theme].datePicker}
            popupClassName={themeStyles[theme].classNameDatePicker}
            allowClear={false}
            format={dateFormat}
            value={dayjs(filters.startDate)}
          />
          <label className="ml-1 mr-1">Hasta:</label>

          <DatePicker
            onChange={(date: any) =>
              setFilters((props) => ({
                ...props,
                endDate: date.format("YYYY-MM-DD"),
              }))
            }
            className={themeStyles[theme].datePickerIndicator}
            style={themeStyles[theme].datePicker}
            popupClassName={themeStyles[theme].classNameDatePicker}
            allowClear={false}
            format={dateFormat}
            value={dayjs(filters.endDate)}
          />
        </div>

        <div className="ml-2 inline-block">
          <label className="mr-1">Sucursal:</label>

          <Select
            value={mappingListStore[filters.store]}
            className={themeStyles[theme].classNameSelector}
            dropdownStyle={themeStyles[theme].dropdownStylesCustom}
            popupClassName={themeStyles[theme].classNameSelectorItem}
            style={{ width: 110 }}
            onSelect={(value: any) =>
              setFilters((props) => ({ ...props, store: value }))
            }
            options={listStore.map((data: any) => ({
              value: data.value,
              label: data.name,
            }))}
          />
        </div>

        <div className="ml-2 inline-block">
          <div
            className={`inline-block px-4 py-1 rounded-md border text-white select-none ${
              Boolean(filters.startDate.length) &&
              Boolean(filters.endDate.length) &&
              "bg-[#1b78e2] border-[#1b78e2] hover:cursor-pointer hover:opacity-80 transition-opacity"
            } flex items-center mx-auto`}
            onClick={() =>
              !loading && dispatch(graphActions.getData(filters)(dispatch))
            }
          >
            Buscar
            {loading && (
              <div className="ml-2">
                <Spinner />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="h-[85vh] overflow-x-auto">
        <div className="h-[38vh] flex justify-center space-x-2">
          {data.itemsAndDevolutions && (
            <div className="h-[50vh] w-full">
              <Line
                options={{
                  ...options,
                  plugins: {
                    ...options.plugins,
                    title: {
                      ...options.plugins.title,
                      text: "Prendas y Devoluciones",
                    },
                  },
                }}
                data={data.itemsAndDevolutions}
              />
            </div>
          )}
          {data.itemsByEmployee && (
            <div className="h-[50vh] w-full">
              <Line
                options={{
                  ...options,
                  plugins: {
                    ...options.plugins,
                    title: {
                      ...options.plugins.title,
                      text: "Prendas por Empleado",
                    },
                  },
                }}
                data={data.itemsByEmployee}
              />
            </div>
          )}
        </div>
        <div className="h-[38vh] flex justify-center space-x-2">
          {data.totalSales && (
            <div className="h-[50vh] w-full">
              <Line
                options={{
                  ...options,
                  plugins: {
                    ...options.plugins,
                    title: {
                      ...options.plugins.title,
                      text: "Total de ventas locales",
                    },
                  },
                }}
                data={data.totalSales}
              />
            </div>
          )}
          {data.totalSalesByEmployees && (
            <div className="h-[50vh] w-full">
              <Line
                options={{
                  ...options,
                  plugins: {
                    ...options.plugins,
                    title: {
                      ...options.plugins.title,
                      text: "Total de ventas locales por empleado",
                    },
                  },
                }}
                data={data.totalSalesByEmployees}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GraphContainer;
