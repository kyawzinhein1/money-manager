import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');

export type GoogleUser = User;

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;
// Cache the access token in memory.
let cachedAccessToken: string | null = null;

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Must be called from a button click or user interaction
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const googleSignOut = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setAccessToken = (token: string) => {
  cachedAccessToken = token;
};

// Drive storage structure
export interface SyncData {
  transactions: any[];
  budgets: any[];
  incomeCategories: string[];
  expenseCategories: string[];
  customCurrency: any;
  settings: any;
  profile: any;
  lastUpdated: string;
}

// Drive Operations
export const findDriveFile = async (token: string): Promise<string | null> => {
  try {
    const url = "https://www.googleapis.com/drive/v3/files?q=name='money_manager_data.json'+and+trashed=false&fields=files(id,name)";
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error(`Drive API returned ${response.status}`);
    }
    const data = await response.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
    return null;
  } catch (error) {
    console.error("Error finding file in Google Drive:", error);
    return null;
  }
};

export const downloadFromDrive = async (token: string, fileId: string): Promise<SyncData | null> => {
  try {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to download data: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error downloading data from Google Drive:", error);
    return null;
  }
};

export const uploadToDrive = async (token: string, data: SyncData, fileId: string | null): Promise<string> => {
  const jsonString = JSON.stringify(data, null, 2);
  
  if (fileId) {
    // Update existing file
    const url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: jsonString
    });
    if (!response.ok) {
      throw new Error(`Failed to update file: ${response.statusText}`);
    }
    const resData = await response.json();
    return fileId;
  } else {
    // Create new file (Multipart related upload to specify metadata and media content)
    const boundary = "money_manager_boundary";
    const url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
    
    const metadata = {
      name: "money_manager_data.json",
      mimeType: "application/json"
    };

    const multipartBody = 
      `\r\n--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: application/json\r\n\r\n` +
      `${jsonString}\r\n` +
      `--${boundary}--`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`
      },
      body: multipartBody
    });

    if (!response.ok) {
      throw new Error(`Failed to create file: ${response.statusText}`);
    }
    const resData = await response.json();
    return resData.id;
  }
};
