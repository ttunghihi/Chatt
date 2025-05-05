import { createSlice } from "@reduxjs/toolkit";

//
import { dispatch } from "../store";

const initialState = {
    sidebar: {
        open: false,
        type: "CONTACT", // có thể là CONTACT, STARTED, SHARED
    }
}

const slice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        ToggleSidebar(state, action){
            state.sidebar.open = !state.sidebar.open;
        },
        UpdateSidebarType(state, action){
            state.sidebar.type = action.payload.type;
        },
    },
});


export default slice.reducer;

export function ToggleSidebar () {
    return async () =>  {
        dispatch(slice.actions.ToggleSidebar());
    }
}

export function UpdateSidebarType (type) {
    return async () => {
        dispatch(slice.actions.UpdateSidebarType({
            type,
        }));
    }
}