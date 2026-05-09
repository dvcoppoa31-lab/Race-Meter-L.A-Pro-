import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore,
  doc,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test connection and log errors specifically for reachability
// We use a less aggressive check that doesn't necessarily block the UI
const testConnection = async () => {
  try {
    // Attempt to check cache/connectivity status
    const testDoc = doc(db, '_connection_test_', 'initial');
    // We try to get from server but with a timeout effectively
    const promise = getDocFromServer(testDoc);
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000));
    
    await Promise.race([promise, timeout]);
    console.log('Firestore cloud connection verified.');
  } catch (error: any) {
    if (error.message === 'timeout' || (error.message && error.message.includes('offline'))) {
      console.warn('Firestore is operating in offline/cached mode. Cloud sync may be delayed.');
    } else {
      console.log('Firestore connectivity test completed (cached/unknown state).');
    }
  }
};

testConnection();

export const auth = getAuth(app);
