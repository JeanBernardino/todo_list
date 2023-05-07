import { createSlice } from '@reduxjs/toolkit'

const userSlice = createSlice({
    name: 'user',
    initialState: {
      user: {}
    },
    reducers: {
      loadUser: (state, params) => {
        console.log('param: ', params)
        state.user = params
      },
    }
})

export const { loadUser } = userSlice.actions
export default userSlice.reducer