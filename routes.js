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
const CHECK_USER_PASSWORD = "/checkUserPassword";
const CHANGE_USER_PASSWORD = "/changeUserPassword";
const DELETE_USER = "/deleteUser";

// Battles
const BATTLES = "/battles";
const ADD_BATTLE = "/add";
const LIKE_BATTLE = "/like";
const UNLIKE_BATTLE = "/unlike";
const START_BATTLE = "/start";
const REFUND_BATTLE = "/refund";
const VOTE_BATTLE = "/vote";
// battleReport
const REPORT_BATTLE = "/:battleId/reports";
const REPORT_COMMENT = "/:commentId/reports";
const LIKE_COMMENT = "/:commentId/like";
const UNLIKE_COMMENT = "/:commentId/unlike";
// Battles
const SUB_BATTLES = "/subBattles";
const ADD_SUB_BATTLE = "/add";
const UPDATE_SUB_BATTLE = "/update";
const LIKE_SUB_BATTLE = "/like";
const UNLIKE_SUB_BATTLE = "/unlike";
const REFUND_SUB_BATTLE = "/refund";

// Comment
const COMMENTS = "/comments";
const ADD_COMMENT = "/add";

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
  authLoginNaverCallback: AUTH_LOGIN_NAVER_CALLBACK,
  authLoginKakaoCallback: AUTH_LOGIN_KAKAO_CALLBACK,
  changeUserInfo: CHANGE_USER_INFO,
  checkUserPassword: CHECK_USER_PASSWORD,
  changeUserPassword: CHANGE_USER_PASSWORD,
  deleteUser: DELETE_USER,
  battles: BATTLES,
  addBattle: ADD_BATTLE,
  likeBattle: LIKE_BATTLE,
  unlikeBattle: UNLIKE_BATTLE,
  startBattle: START_BATTLE,
  refundBattle: REFUND_BATTLE,
  comments: COMMENTS,
  addComment: ADD_COMMENT,
  subBattles: SUB_BATTLES,
  addSubBattle: ADD_SUB_BATTLE,
  updateSubBattle: UPDATE_SUB_BATTLE,
  likeSubBattle: LIKE_SUB_BATTLE,
  unlikeSubBattle: UNLIKE_SUB_BATTLE,
  refundSubBattle: REFUND_SUB_BATTLE,
  voteBattle: VOTE_BATTLE,
  reportBattle: REPORT_BATTLE,
  reportComment: REPORT_COMMENT,
  likeComment: LIKE_COMMENT,
  unlikeComment: UNLIKE_COMMENT,
};

export default routes;
