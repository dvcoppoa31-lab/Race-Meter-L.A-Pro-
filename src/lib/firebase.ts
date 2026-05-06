import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentSingleTabManager,
  doc,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Firestore with robust settings for the development/preview environment
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager({})
  })
}, firebaseConfig.firestoreDatabaseId);

// Test connection and log errors specifically for reachability
const testConnection = async () => {
  try {
    // Attempt to read a dummy document directly from the server to verify connectivity
    await getDocFromServer(doc(db, '_connection_test_', 'initial'));
  } catch (error: any) {
    if (error.message && error.message.includes('offline')) {
      console.error('Firestore is currently unreachable. Please check your network or Firebase configuration.', error);
    } else {
      // Ignore other errors like "not found" or "permission denied" as we just want to test connectivity
      console.log('Firestore connectivity test completed.');
    }
  }
};

testConnection();

export const auth = getAuth(app);
