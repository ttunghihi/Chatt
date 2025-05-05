import { combineReducers } from "redux";
import storage from "redux-persist/lib/storage";
import appReducer from "./slices/app";
import authReducer from "./slices/auth"; // Import authReducer
import chatReducer from "./slices/chat";
// slices

const rootPeristConfig = {
  key: "root",
  storage,
  keyPrefix: "redux-",
  whitelist: ["auth", "chat"], // Chỉ persist trạng thái auth
};

const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer, // Thêm authReducer vào rootReducer
  chat: chatReducer,
});

export { rootPeristConfig, rootReducer };