import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Ensure single initialization of Firebase app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');

export type GoogleUser = User;

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener
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

// Sign in with Google Popup
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

// Sign out
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

export interface BackupData {
  transactions: any[];
  budgets: any[];
  incomeCategories: string[];
  expenseCategories: string[];
  customCurrency: any;
  settings: any;
  profile: any;
  lastUpdated: string;
}

// Convert string to base64url (Gmail safe)
function base64url(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Send backup via Gmail API
export const sendBackupEmail = async (
  token: string,
  toEmail: string,
  backupData: BackupData
): Promise<boolean> => {
  try {
    const subject = `Money Manager Backup - ${new Date().toLocaleDateString()}`;
    const boundary = "money_manager_backup_boundary";

    const htmlBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e5ea; border-radius: 16px; background-color: #ffffff;">
  <div style="text-align: center; margin-bottom: 24px;">
    <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 12px; background-color: #007aff; color: #ffffff; font-size: 24px; font-weight: bold; text-align: center;">$</div>
    <h2 style="margin-top: 12px; margin-bottom: 4px; color: #1c1c1e; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">Money Manager</h2>
    <p style="margin: 0; color: #8e8e93; font-size: 13px;">Gmail Automated Backup Service</p>
  </div>
  
  <div style="background-color: #f2f2f7; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
    <h3 style="margin-top: 0; margin-bottom: 12px; color: #1c1c1e; font-size: 14px; font-weight: 700;">Backup Details</h3>
    <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
      <tr>
        <td style="padding: 4px 0; color: #8e8e93;">Date Created</td>
        <td style="padding: 4px 0; text-align: right; color: #1c1c1e; font-weight: 600;">${new Date().toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #8e8e93;">Transactions Count</td>
        <td style="padding: 4px 0; text-align: right; color: #1c1c1e; font-weight: 600;">${backupData.transactions?.length || 0} items</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #8e8e93;">Budgets Tracked</td>
        <td style="padding: 4px 0; text-align: right; color: #1c1c1e; font-weight: 600;">${backupData.budgets?.length || 0} categories</td>
      </tr>
    </table>
  </div>
  
  <p style="color: #3a3a3c; font-size: 13px; line-height: 1.5; margin-bottom: 20px;">
    Your financial records are safely stored in the attached JSON backup file (<strong>money_manager_backup.json</strong>).
  </p>
  
  <div style="padding: 12px; border-left: 4px solid #34c759; background-color: rgba(52, 199, 89, 0.1); margin-bottom: 24px; border-radius: 4px;">
    <p style="margin: 0; color: #1c1c1e; font-size: 12px; font-weight: 600; line-height: 1.4;">
      How to Restore:
    </p>
    <p style="margin: 4px 0 0 0; color: #3a3a3c; font-size: 12px; line-height: 1.4;">
      1. Download the attached <strong>money_manager_backup.json</strong> file.<br>
      2. Open the Money Manager app.<br>
      3. Navigate to Settings &rarr; Data Management &rarr; Import Backup.<br>
      4. Choose this downloaded file to restore all your records instantly.
    </p>
  </div>
  
  <hr style="border: 0; border-top: 1px solid #e5e5ea; margin-bottom: 16px;" />
  <p style="text-align: center; color: #8e8e93; font-size: 11px; margin: 0;">
    Money Manager App - Secure Personal Finance
  </p>
</div>
`;

    // Construct raw MIME multipart message
    const rawMime = [
      `To: ${toEmail}`,
      `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=utf-8',
      'Content-Transfer-Encoding: base64',
      '',
      btoa(unescape(encodeURIComponent(htmlBody))),
      '',
      `--${boundary}`,
      'Content-Type: application/json; name="money_manager_backup.json"',
      'Content-Disposition: attachment; filename="money_manager_backup.json"',
      'Content-Transfer-Encoding: base64',
      '',
      btoa(unescape(encodeURIComponent(JSON.stringify(backupData, null, 2)))),
      '',
      `--${boundary}--`
    ].join('\r\n');

    const encodedEmail = base64url(rawMime);

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: encodedEmail
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gmail API returned ${response.status}: ${errText}`);
    }

    return true;
  } catch (error) {
    console.error("Error sending backup email:", error);
    throw error;
  }
};
