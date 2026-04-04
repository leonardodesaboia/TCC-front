export type UserRole = 'client' | 'professional' | 'admin';

export type LoggedUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
};

export type LoginSession = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
  user: LoggedUser;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';
const BASE64_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function buildUrl(path: string) {
  if (API_URL.endsWith('/')) {
    return `${API_URL.slice(0, -1)}${path}`;
  }

  return `${API_URL}${path}`;
}

function decodeBase64(text: string) {
  let result = '';

  for (let index = 0; index < text.length; index += 4) {
    const piece = text.slice(index, index + 4);
    let number = 0;
    let padding = 0;

    for (let position = 0; position < 4; position += 1) {
      number <<= 6;

      const character = piece[position];

      if (!character || character === '=') {
        padding += 1;
      } else {
        number += BASE64_LETTERS.indexOf(character);
      }
    }

    result += String.fromCharCode((number >> 16) & 255);

    if (padding < 2) {
      result += String.fromCharCode((number >> 8) & 255);
    }

    if (padding < 1) {
      result += String.fromCharCode(number & 255);
    }
  }

  return result;
}

function getNetworkErrorMessage() {
  return `Nao foi possivel falar com a API em ${API_URL}. Se estiver no celular, confirme se o app e o computador estao na mesma rede Wi-Fi e reinicie o Expo apos mudar o arquivo .env.`;
}

function readToken(token: string) {
  const parts = token.split('.');

  if (parts.length < 2) {
    throw new Error('O token recebido do backend é inválido.');
  }

  // O JWT vem em 3 partes separadas por ponto.
  // A parte do meio tem os dados do usuário em base64.
  const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const missingChars = base64.length % 4;
  const paddedBase64 = missingChars === 0 ? base64 : `${base64}${'='.repeat(4 - missingChars)}`;
  const jsonText = decodeBase64(paddedBase64);

  return JSON.parse(jsonText);
}

async function readErrorMessage(response: Response) {
  try {
    const data = await response.json();

    if (data?.fields) {
      const firstFieldName = Object.keys(data.fields)[0];

      if (firstFieldName && data.fields[firstFieldName]) {
        return data.fields[firstFieldName];
      }
    }

    if (data?.message) {
      return data.message;
    }
  } catch {
    // Se a API não devolver JSON, usamos a mensagem padrão logo abaixo.
  }

  if (response.status === 401) {
    return 'E-mail ou senha inválidos.';
  }

  if (response.status === 403) {
    return 'Sua conta não pode acessar o All Set no momento.';
  }

  if (response.status === 423) {
    return 'Sua conta está em processo de exclusão temporária.';
  }

  return 'Não foi possível concluir a requisição.';
}

async function findLoggedUser(accessToken: string, userId: string, email: string, role: UserRole): Promise<LoggedUser> {
  const response = await fetch(buildUrl(`/api/users/${userId}`), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return {
      id: userId,
      name: email,
      email,
      phone: '',
      role,
    };
  }

  const data = await response.json();

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role,
  };
}

export async function login(email: string, password: string): Promise<LoginSession> {
  const cleanEmail = email.trim();
  let response: Response;

  try {
    response = await fetch(buildUrl('/api/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: cleanEmail,
        password,
      }),
    });
  } catch {
    throw new Error(getNetworkErrorMessage());
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const data = await response.json();
  const tokenData = readToken(data.accessToken);
  const user = await findLoggedUser(data.accessToken, tokenData.sub, cleanEmail, tokenData.role);

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresIn: data.expiresIn,
    expiresAt: Date.now() + data.expiresIn * 1000,
    user,
  };
}

export async function logout(refreshToken: string) {
  try {
    await fetch(buildUrl('/api/auth/logout'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    throw new Error(getNetworkErrorMessage());
  }
}

export async function sendResetCode(email: string) {
  const cleanEmail = email.trim();
  let response: Response;

  try {
    response = await fetch(buildUrl('/api/auth/forgot-password'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: cleanEmail,
      }),
    });
  } catch {
    throw new Error(getNetworkErrorMessage());
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
}

export async function resetUserPassword(email: string, code: string, newPassword: string) {
  const cleanEmail = email.trim();
  const cleanCode = code.trim();
  let response: Response;

  try {
    response = await fetch(buildUrl('/api/auth/reset-password'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: cleanEmail,
        code: cleanCode,
        newPassword,
      }),
    });
  } catch {
    throw new Error(getNetworkErrorMessage());
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
}

export function getApiUrl() {
  return API_URL;
}

export function getRoleLabel(role: UserRole) {
  if (role === 'client') {
    return 'Contratante';
  }

  if (role === 'professional') {
    return 'Profissional';
  }

  return 'Administrador';
}

export function getRoleDescription(role: UserRole) {
  if (role === 'client') {
    return 'Conta preparada para buscar, contratar e acompanhar pedidos.';
  }

  if (role === 'professional') {
    return 'Conta preparada para receber solicitações, negociar preço e executar serviços.';
  }

  return 'Conta interna da plataforma para operação e moderação.';
}
