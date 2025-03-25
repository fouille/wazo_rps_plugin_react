import { configureStore } from '@reduxjs/toolkit'
import headerSlice from '../features/common/headerSlice'
import modalSlice from '../features/common/modalSlice'
import rightDrawerSlice from '../features/common/rightDrawerSlice'
import leadsSlice from '../features/devices/leadSlice'
import loadingSlice from '../features/common/loadingSlice'

const combinedReducer = {
  header : headerSlice,
  rightDrawer : rightDrawerSlice,
  modal : modalSlice,
  lead : leadsSlice,
  loading : loadingSlice
}

export default configureStore({
    reducer: combinedReducer,
    //permet de ne pas avoir les erreurs de non-serialisation des objets 
    // (quand on passe une fonction à travers une fonction sans middleware)
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
})