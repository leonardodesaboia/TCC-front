import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;

    if (data?.fields) {
      const firstKey = Object.keys(data.fields)[0];
      if (firstKey && data.fields[firstKey]) {
        return data.fields[firstKey];
      }
    }

    if (data?.message) {
      return Array.isArray(data.message) ? data.message[0] : data.message;
    }

    if (error.response?.status === 401) return 'E-mail ou senha inválidos.';
    if (error.response?.status === 403) return 'Sua conta não pode acessar o AllSet no momento.';
    if (error.response?.status === 423) return 'Sua conta está em processo de exclusão temporária.';

    // Sem resposta, o axios só diz "Network Error". No celular o motivo real
    // (ex.: falha ao ler o arquivo, conexão encerrada) fica em request._response.
    if (!error.response && error.code === AxiosError.ERR_NETWORK) {
      const nativeDetail = (error.request as { _response?: unknown } | undefined)?._response;
      if (typeof nativeDetail === 'string' && nativeDetail.trim()) {
        return `Falha de conexão: ${nativeDetail.trim()}`;
      }
    }
  }

  if (error instanceof Error) return error.message;

  return 'Erro inesperado. Tente novamente.';
}
