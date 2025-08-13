// Define a estrutura do payload que o seu JWT Strategy retorna
export interface JwtPayload {
  sub: number;
  username: string;
  roles: string[];
}

// Define a estrutura do payload que o seu Refresh Token Strategy retorna
interface RefreshTokenPayload extends JwtPayload {
  refreshToken: string;
}

// Estende a interface Request do Express
declare namespace Express {
  export interface Request {
    // Agora a propriedade 'user' existe e tem um tipo definido
    user: JwtPayload | RefreshTokenPayload;
  }
}
