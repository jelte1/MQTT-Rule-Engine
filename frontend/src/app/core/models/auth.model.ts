export interface AuthModel {
  token: string;
  userId: string;
  refreshToken: string;
}

export interface LoginModel {
  username: string;
  password: string;
}

export interface RegisterModel {
  username: string;
  password: string;
}

export interface CurrentUser {
  token: string;
  username: string;
  email: string;
  userId: string;
}
