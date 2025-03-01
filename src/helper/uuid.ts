import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';

export const generateUUID = (from?: string): string => {
  const uid = from ?? uuidv4();
  return uuidv5(uid, uuidv5.DNS).replace(/-/g, '');
};
