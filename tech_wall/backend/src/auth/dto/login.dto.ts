import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  login: string; // pode ser username ou email

  @IsNotEmpty()
  @IsString()
  senha: string;
}
