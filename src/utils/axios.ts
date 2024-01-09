import axios from "axios";

//const baseURL = process.env.REACT_APP_BASE_URL || "http://127.0.0.1:30040";
const baseURL = "http://127.0.0.1:30040";

const instance = axios.create({
  baseURL,
});

const Axios = {
  instance,
};

export default Axios;
