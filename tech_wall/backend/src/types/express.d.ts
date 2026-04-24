// Payload from JWT Strategy
export interface AuthenticatedUser {
  id: number;
  username: string;
  role: string[];
}

// Payload from Refresh Token Strategy
export interface RefreshTokenUser {
  sub: number;
  username: string;
  role: string[];
  refreshToken: string;
}

// Estende a interface Request do Express
declare global {
  namespace Express {
    export interface Request {
      user?: AuthenticatedUser | RefreshTokenUser;
    }
  }
}
