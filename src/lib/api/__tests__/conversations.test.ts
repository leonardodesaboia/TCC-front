import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../client', () => ({ apiClient: { get: vi.fn() } }));
vi.mock('../orders', () => ({ ordersApi: { getMyOrders: vi.fn() } }));
vi.mock('@/lib/constants/config', () => ({ USE_MOCKS_ENABLED: false }));
vi.mock('@/lib/mocks/runtime', () => ({ mockConversationsApi: {} }));
import { apiClient } from '../client';
import { ordersApi } from '../orders';
import { conversationsApi } from '../conversations';

beforeEach(() => vi.resetAllMocks());
describe('conversation context', () => {
  const conversations = [
    { id: 'chat-a', orderId: 'order-a', otherParticipantName: 'Mesmo cliente', lastMessage: { content: 'Olá', sentAt: '2026-10-24T10:00:00Z' } },
    { id: 'chat-b', orderId: 'order-b', otherParticipantName: 'Mesmo cliente' },
  ];
  it('distinguishes orders with the same counterpart without one request per row', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: conversations });
    vi.mocked(ordersApi.getMyOrders).mockResolvedValue([{ id: 'order-a', serviceName: 'Limpeza', status: 'completed' }, { id: 'order-b', serviceName: 'Passar roupas', status: 'accepted' }] as never);
    const result = await conversationsApi.getAll();
    expect(result[0].order?.serviceName).toBe('Limpeza');
    expect(result[1].order?.serviceName).toBe('Passar roupas');
    expect(result[0].lastMessageAt).toBe('2026-10-24T10:00:00Z');
    expect(ordersApi.getMyOrders).toHaveBeenCalledTimes(1);
  });
  it('preserves access to chat when the order list is unavailable', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: conversations });
    vi.mocked(ordersApi.getMyOrders).mockRejectedValue(new Error('offline'));
    const result = await conversationsApi.getAll();
    expect(result).toHaveLength(2);
    expect(result[0].orderId).toBe('order-a');
    expect(result[0].lastMessage).toBe('Olá');
  });
  it('does not conceal an actual conversation API error', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error('unauthorized'));
    vi.mocked(ordersApi.getMyOrders).mockResolvedValue([]);
    await expect(conversationsApi.getAll()).rejects.toThrow('unauthorized');
  });
});
