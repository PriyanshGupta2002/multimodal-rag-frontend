export type SignupRequest = {
  name: string;
  email: string;
  password: string;
};

export type SignupResponse = {
  message?: string;
  user?: {
    id: string;
    name?: string;
    email: string;
  };
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token?: string;
  token_type?: string;
  message?: string;
};

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
};
