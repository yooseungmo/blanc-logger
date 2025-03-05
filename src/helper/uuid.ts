import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';

/** 입력 문자열을 기반으로 UUID를 생성하며, 입력이 없을 경우 랜덤 UUID를 사용하고 하이픈을 제거 */
export const generateUUID = (from?: string): string => {
  const uid = from ?? uuidv4();
  return uuidv5(uid, uuidv5.DNS).replace(/-/g, '');
};
