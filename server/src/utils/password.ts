import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string) => bcrypt.hash(password, SALT_ROUNDS);

export const verifyPassword = async (password: string, hash: string) => bcrypt.compare(password, hash);

export const hashToken = async (token: string) => bcrypt.hash(token, SALT_ROUNDS);

export const verifyToken = async (token: string, hash: string) => bcrypt.compare(token, hash);
