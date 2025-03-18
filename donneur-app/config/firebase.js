import  { initializeApp }   from "firebase/app";
import  { getAuth }         from "firebase/auth";
import  { getFirestore }    from "firebase/firestore";
import { getStorage }       from 'firebase/storage';
import AsyncStorage         from '@react-native-async-storage/async-storage';

import  Constants           from "expo-constants";


const firebaseConfig = {
  apiKey:               Constants.expoConfig.extra.apiKey,
  authDomain:           Constants.expoConfig.extra.authDomain,
  projectId:            Constants.expoConfig.extra.projectId,
  storageBucket:        Constants.expoConfig.extra.storageBucket,
  messagingSenderId:    Constants.expoConfig.extra.messagingSenderId,
  appId:                Constants.expoConfig.extra.appId,
  databaseURL:          Constants.expoConfig.extra.databaseURL,
};


const app               = initializeApp(firebaseConfig);

export const    auth       = getAuth(app);
export const    database   = getFirestore(app);
export const storage = getStorage(app);
export default  app;
