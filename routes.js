const SEARCH = "/search";
// Global
const HOME = "/";
const REGISTER = "/register";
const LOGIN = "/login";
const LOGOUT = "/logout";

//SNS LOGIN
const AUTH_LOGIN_NAVER_CALLBACK = "/auth/login/naver/callback";
const AUTH_LOGIN_KAKAO_CALLBACK = "/auth/login/kakao/callback";

// Users
const USERS = "/users";
const CHANGE_USER_INFO = "/:userId";
const SEND_RESET_PASSWORD_EMAIL = "/:userId/send-reset-password-email";
const CHECK_USER_PASSWORD = "/check-password";
const CHECK_RESET_PASSWORD_TOKEN = "/:userId/check-reset-password-token";
const RESET_USER_PASSWORD = "/:userId/password";
const DELETE_USER = "/:userId";

// Battles
const BATTLES = "/battles";
const ADD_BATTLE = "/";
const UPDATE_BATTLE = "/:battleId";
const LIKE_BATTLE = "/like";
const VOTE_BATTLE = "/:battleId/vote";
const REPORT_BATTLE = "/:battleId/reports";
// SubBattles
const SUB_BATTLES = "/sub-battles";
const ADD_SUB_BATTLE = "/";

// Comment
const COMMENTS = "/comments";
const ADD_COMMENT = "/add";
const UPDATE_COMMENT = "/:commentId/update";
const DELETE_COMMENT = "/:commentId/delete";
const REPORT_COMMENT = "/:commentId/reports";
const LIKE_COMMENT = "/:commentId/like";
const UNLIKE_COMMENT = "/:commentId/unlike";

// Rank
const RANKS = "/ranks";
// GoldHistory
const GOLD_HISTORYS = "/gold-histories";
const UPDATE_GOLD_HISTORYS = "/:goldHistoryId";
// PaymentHistory
const PAYMENT_HISTORYS = "/payment-history";
const UPDATE_PAYMENT_HISTORYS = "/:paymentHistoryId";
// PaymentHistory
const BANK_ACCOUNT_NUMBER = "/bank-account-number";
// ExchangeHistory
const EXCHANGE_HISTORY = "/exchange-history";
const UPDATE_EXCHANGE_HISTORY = "/:exchangeHistoryId";

const routes = {
  home: HOME,
  register: REGISTER,
  login: LOGIN,
  sendResetPasswordEmail: SEND_RESET_PASSWORD_EMAIL,
  logout: LOGOUT,
  search: SEARCH,
  users: USERS,
  authLoginNaverCallback: AUTH_LOGIN_NAVER_CALLBACK,
  authLoginKakaoCallback: AUTH_LOGIN_KAKAO_CALLBACK,
  changeUserInfo: CHANGE_USER_INFO,
  checkResetPasswordToken: CHECK_RESET_PASSWORD_TOKEN,
  checkUserPassword: CHECK_USER_PASSWORD,
  resetUserPassword: RESET_USER_PASSWORD,
  deleteUser: DELETE_USER,
  battles: BATTLES,
  addBattle: ADD_BATTLE,
  updateBattle: UPDATE_BATTLE,
  likeBattle: LIKE_BATTLE,
  comments: COMMENTS,
  addComment: ADD_COMMENT,
  subBattles: SUB_BATTLES,
  addSubBattle: ADD_SUB_BATTLE,
  voteBattle: VOTE_BATTLE,
  reportBattle: REPORT_BATTLE,
  reportComment: REPORT_COMMENT,
  likeComment: LIKE_COMMENT,
  unlikeComment: UNLIKE_COMMENT,
  updateComment: UPDATE_COMMENT,
  deleteComment: DELETE_COMMENT,
  ranks: RANKS,
  goldHistory: GOLD_HISTORYS,
  updateGoldHistory: UPDATE_GOLD_HISTORYS,
  paymentHistory: PAYMENT_HISTORYS,
  updatePaymentHistory: UPDATE_PAYMENT_HISTORYS,
  bankAccountNumber: BANK_ACCOUNT_NUMBER,
  exchangeHistory: EXCHANGE_HISTORY,
  updateExchangeHistory: UPDATE_EXCHANGE_HISTORY,
};

export default routes;
