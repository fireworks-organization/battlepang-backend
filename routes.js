// Global
const HOME = "/";
const JOIN = "/join";
const LOGIN = "/login";
const LOGOUT = "/logout";
const FIND_EMAIL = "/findEmail";
const RESET_PASSWORD = "/resetPassword";
const GET_USER_INFO = "/getUserInfo";
const CHANGE_USER_INFO = "/changeUserInfo";
const SEARCH = "/search";

//SNS LOGIN
const AUTH_LOGIN_NAVER_CALLBACK = "/auth/login/naver/callback";
const AUTH_LOGIN_KAKAO_CALLBACK = "/auth/login/kakao/callback";

// Users

const USERS = "/users";
const USER_DETAIL = "/:id";
const EDIT_PROFILE = "/edit-profile";
const CHANGE_PASSWORD = "/change-password";
const CHECK_USER_PASSWORD = "/checkUserPassword";
const CHANGE_USER_PASSWORD = "/changeUserPassword";
const DELETE_USER = "/deleteUser";

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
  changePassword: CHANGE_PASSWORD,
  authLoginNaverCallback: AUTH_LOGIN_NAVER_CALLBACK,
  authLoginKakaoCallback: AUTH_LOGIN_KAKAO_CALLBACK,
  changeUserInfo: CHANGE_USER_INFO,
  checkUserPassword: CHECK_USER_PASSWORD,
  changeUserPassword: CHANGE_USER_PASSWORD,
  deleteUser: DELETE_USER
};

export default routes;
