import  { createSlice } from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';
import type { User } from '../../utils/types';
import { getSession, setSession, removeSession } from '../../utils/storage';

const SESSION_USER_KEY = 'session.user';

type AuthState = {
  user: User | null;
  status: 'idle' | 'auth' | 'error';
  error?: string;
};

const initialState: AuthState = {
  user: getSession<User>(SESSION_USER_KEY),
  status: 'idle',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateFromSession(state) {
      state.user = getSession<User>(SESSION_USER_KEY);
    },
    loginSuccess(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.status = 'auth';
      setSession(SESSION_USER_KEY, action.payload);
    },
    logout(state) {
      state.user = null;
      state.status = 'idle';
      removeSession(SESSION_USER_KEY);
    },
  },
});

export const { hydrateFromSession, loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
