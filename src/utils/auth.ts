import CryptoJS from 'crypto-js';

export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString();
};

export const verifyPassword = (inputPassword: string, hashedPassword: string): boolean => {
  const hashedInput = hashPassword(inputPassword);
  return hashedInput === hashedPassword;
};

export const generateToken = (): string => {
  return CryptoJS.lib.WordArray.random(32).toString();
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const clearAuthData = () => {
  localStorage.removeItem('session');
};