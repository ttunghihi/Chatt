const initialState = {
    currentChat: null, // Trạng thái mặc định
  };
  
  const chatReducer = (state = initialState, action) => {
    switch (action.type) {
      case "SET_CURRENT_CHAT":
        return {
          ...state,
          currentChat: action.payload, // Cập nhật currentChat
        };
      default:
        return state;
    }
  };
  
  // Action để thiết lập currentChat
  export const setCurrentChat = (chat) => ({
    type: "SET_CURRENT_CHAT",
    payload: chat,
  });
  
  export default chatReducer;