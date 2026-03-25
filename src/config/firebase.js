import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import siteConfig from '@generated/docusaurus.config';

const { firebaseConfig } = siteConfig.customFields;

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
