import axios from "axios"
import { createAsyncThunk } from '@reduxjs/toolkit'
import { SetLocalStorage } from "../features/common/baseLocalstorage";
import { App as Portal } from '@wazo/euc-plugins-sdk';

const portal = new Portal();

const initializePortal = async () => {
  try {
    //ici on initialise et retourne de type de compte portal connecte
    await portal.initialize();
    const context = portal.getContext();
    const fontFamily = context.app.theme.typography.fontFamily;

    // Appliquer la police d'écriture à l'ensemble de l'application
    if (fontFamily) {
      document.body.style.fontFamily = fontFamily;
    }
    const accountType = context.app.extra.administrator.organization.resource;
    return accountType;

  } catch (error) {
    //si il y a une erreur dinitialisation on affiche la page derreur login
    console.error('Error initializing portal:', error);
    window.location.href = '/login';
    return null;
  }
};

const checkAccountType = (accountType) => {
  switch (accountType) {
    case 'resellers':
      return true;
    case 'administrators':
      return true;
    case 'customers':
      return false;
    case 'locations':
      return false;
    default:
      return false;
  }
};

const checkAuth = async () => {

    const accountType = await initializePortal();

    if (!accountType) return;

    const isReseller = checkAccountType(accountType);
    const PUBLIC_ROUTES = ["login"]

    const isPublicPage = PUBLIC_ROUTES.some( r => window.location.href.includes(r))

    if(!isReseller && !isPublicPage){
        window.location.href = '/login'
        return;
    }else{
        axios.interceptors.request.use(function (config) {
            // UPDATE: Add this code to show global loading indicator
            // document.body.classList.add('loading-indicator');
            return config
          }, function (error) {
            return Promise.reject(error);
        });
          
        axios.interceptors.response.use(function (response) {
            // UPDATE: Add this code to hide global loading indicator
            // document.body.classList.remove('loading-indicator');
            return response;
          }, function (error) {
            // document.body.classList.remove('loading-indicator');
            return Promise.reject(error);
        });
        //ici on initialise le localstorage si pas d'échec dinitialisation ou de droits conforme
        const context = portal.getContext();
        console.log(context);
        
        await SetLocalStorage(context)

        return isReseller
    }
}

export default checkAuth