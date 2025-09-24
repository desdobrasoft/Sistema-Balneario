// Payload from JWT Strategy
export interface AuthenticatedUser {
  id: number;
  username: string;
  roles: string[];
}

// Payload from Refresh Token Strategy
export interface RefreshTokenUser {
  sub: number;
  username: string;
  roles: string[];
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
