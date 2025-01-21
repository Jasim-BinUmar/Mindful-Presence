//const BASE_URL = "http://localhost:5000";
const BASE_URL="http://192.168.0.105:5000"
// process.env.REACT_APP_API_BASE_URL || 

const endpoints = {
  getUsers: `${BASE_URL}/users`,
  createUser: `${BASE_URL}/users/create`,
  deleteUser: `${BASE_URL}/users/delete`,
  login: `${BASE_URL}/auth/login`,
  //Book Session endpoints
  bookSession: `${BASE_URL}/api/sessions/book`,
};

export default endpoints;
