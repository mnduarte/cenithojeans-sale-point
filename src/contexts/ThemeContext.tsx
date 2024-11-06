import React, { createContext, useContext, useReducer } from "react";

// Definir las acciones disponibles para el usuario
const actionTypes = {
  CHANGE_THEME: "change_theme",
};

// Crear el contexto de precios
const ThemeContext = createContext<any>(undefined);

// Proveedor de contexto para el contexto de precios
export const ThemeProvider: React.FC<any> = ({ children }) => {
  const initialState: any = {
    theme: "dark",
    themeStyles: {
      dark: {
        textColor: "#ffffff",
        tailwindcss: {
          body: "bg-[#252525] text-white select-none",
          menuTab: "bg-[#333333] hover:bg-[#484E55]",
          inputText: "bg-[#3B3B3B]",
          priceBox: "hover:bg-[#484E55]",
          table: {
            checkbox: "appearance-none bg-[#3B3B3B]",
            main: "bg-[#252525]",
            thead: {
              th: "border border-[#333333] bg-gray-500 p-2",
            },
            tbody: {
              td: "border border-[#292A28]  p-1",
            },
            par: "bg-[#1b78e2]",
            impar: "bg-[#1E1E1E]",
            hover: "hover:bg-[#1E1E1E]",
          },
          border: "border-[#484E55]",
          modal: "bg-gray-800",
        },
        classNameDatePicker: "ant-picker-custom-style",
        classNameSelector: "ant-selector-custom-style",
        classNameSelectorItem: "selector-item",
        datePickerIndicator: "ant-datepicker-indicator-custom",
        dropdownStylesCustom: {
          backgroundColor: "#333333",
        },
        datePicker: {
          backgroundColor: "#3B3B3B",
          color: "#fff",
          width: 120,
        },
      },
      light: {
        textColor: "#6B7280",
        tailwindcss: {
          body: "bg-[#FAFAFA] text-gray-500 select-none",
          menuTab:
            "bg-[#edf9ff] text-gray-500 hover:bg-[#b2b2b2] hover:text-white",
          inputText: "border border-[#D9D9D9] bg-[#FFFFFF]",
          priceBox: "hover:bg-[#edf9ff]",
          table: {
            checkbox: "appearance-none bg-[#ffffff]",
            thead: {
              th: "border border-[#F0F0F0] bg-[#F0F0F0] p-2",
            },
            tbody: {
              td: "border border-[#F0F0F0] p-1",
            },
            main: "bg-[#FFFFFF]",
            par: "bg-[#1b78e2]",
            impar: "bg-[#FAFAFA]",
            hover: "hover:bg-[#FAFAFA]",
          },
          border: "border-[#dbdbdb]",
          modal: "bg-[#FAFAFA]",
        },
        classNameDatePicker: "",
        classNameSelector: "",
        classNameSelectorItem: "",
        datePickerIndicator: "",
        dropdownStylesCustom: {},
        datePicker: {
          width: 120,
        },
      },
    },
  };

  // Reducer para manejar acciones
  const reducer = (state: any, action: any) => {
    switch (action.type) {
      case actionTypes.CHANGE_THEME: {
        return {
          ...state,
          loading: false,
          theme: state.theme === "dark" ? "light" : "dark",
        };
      }
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <ThemeContext.Provider value={{ state, dispatch }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personalizado para acceder al contexto de empleados
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de un ThemeProvider");
  }
  return context;
};

// Acciones para modificar el estado del contexto de precios
export const themeActions = {
  changeTheme: () => async (dispatch: any) => {
    return dispatch({
      type: actionTypes.CHANGE_THEME,
      payload: {},
    });
  },
};
