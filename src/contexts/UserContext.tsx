import React, { createContext, useContext, useReducer } from "react";
import { ERROR_MESSAGE_TIMEOUT } from "../utils/error";
import Api from "../services/Api";

// Definir las acciones disponibles para el usuario
const actionTypes = {
  LOADING: "loading",
  ERROR: "error",
  LOGIN: "login",
  ERROR_LOGIN: "error_login",
};
// Tipo de estado para el contexto de empleados
type UserState = {
  loading: boolean;
  error: any;
  user: any;
};
// Crear el contexto de precios
type UserContextType = {
  state: UserState; // Asegúrate de que PriceState esté definido según tu estructura
  dispatch: React.Dispatch<any>; // O ajusta el tipo según tu implementación
};

// Crear el contexto de precios
const UserContext = createContext<UserContextType | undefined>(undefined);

type UserProviderProps = {
  children?: React.ReactNode;
};

// Proveedor de contexto para el contexto de precios
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const initialState: UserState = {
    loading: false,
    error: null,
    user: {
      username: null,
      role: null,
      store: null,
    },
    /*user: {
      username: "admin",
      role: "ADMIN",
      store: "ALL",
    },*/
    
  };

  // Reducer para manejar acciones
  const reducer = (state: UserState, action: any) => {
    switch (action.type) {
      case actionTypes.LOADING: {
        return {
          ...state,
          loading: true,
          error: null,
        };
      }
      case actionTypes.LOGIN: {
        return {
          ...state,
          loading: false,
          user: {
            username: action.payload.username,
            role: action.payload.role,
            store: action.payload.store,
          },
        };
      }
      case actionTypes.ERROR_LOGIN: {
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
      }
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personalizado para acceder al contexto de empleados
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser debe usarse dentro de un UserProvider");
  }
  return context;
};

// Acciones para modificar el estado del contexto de precios
export const userActions = {
  login:
    ({ username, password }: any) =>
    async (dispatch: any) => {
      dispatch({
        type: actionTypes.LOADING,
        payload: { loading: true },
      });

      try {
        const { data } = await Api.login({ username, password });

        if (data.user) {
          return dispatch({
            type: actionTypes.LOGIN,
            payload: data.user,
          });
        }

        dispatch({
          type: actionTypes.ERROR_LOGIN,
          payload: "Usuario o clave inconrrectos",
        });
      } catch (error) {
        console.log(error);

        dispatch({
          type: actionTypes.ERROR,
          payload: ERROR_MESSAGE_TIMEOUT,
        });
      }
    },
};
