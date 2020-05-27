// Global
const HOME = "/";
const JOIN = "/join";
const LOGIN = "/login";
const LOGOUT = "/logout";
const FIND_EMAIL = "/findEmail";
const RESET_PASSWORD = "/resetPassword";
const GET_USER_INFO = "/getUserInfo";
const SEARCH = "/search";

// Users

const USERS = "/users";
const USER_DETAIL = "/:id";
const EDIT_PROFILE = "/edit-profile";
const CHANGE_PASSWORD = "/change-password";

const routes = {
  home: HOME,
  join: JOIN,
  login: LOGIN,
  findEmail: FIND_EMAIL,
  resetPassword: RESET_PASSWORD,
  getUserInfo: GET_USER_INFO,
  logout: LOGOUT,
  search: SEARCH,
  users: USERS,
  userDetail: USER_DETAIL,
  editProfile: EDIT_PROFILE,
  changePassword: CHANGE_PASSWORD
};

export default routes;
