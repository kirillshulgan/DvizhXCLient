import apiClient from './client';
import type { Board, Card, CreateCardRequest, MoveCardRequest, UpdateCardRequest } from '../types';

export const kanbanService = {

    // GET /api/kanban/{eventId}
    getBoard: async (eventId: string): Promise<Board> => {
        const response = await apiClient.get<Board>(`/kanban/${eventId}`);
        return response.data;
    },

    // POST /api/kanban/cards
    createCard: async (payload: CreateCardRequest): Promise<Card> => {
        const response = await apiClient.post<Card>('/kanban/cards', payload);
        return response.data;
    },

    // PUT /api/kanban/cards/move
    moveCard: async (payload: MoveCardRequest): Promise<void> => {
        // Если бэкенд возвращает 200 OK без тела, используем void
        await apiClient.put('/kanban/cards/move', payload);
    },

    // PUT /api/kanban/cards/{id}
    updateCard: async (cardId: string, payload: UpdateCardRequest): Promise<void> => {
        // Обрати внимание: cardId обычно идет в URL, а данные обновления — в Body.
        // Я убрал дублирование cardId внутри body, если твой DTO на бэкенде не требует этого явно.
        await apiClient.put(`/kanban/cards/${cardId}`, payload);
    },

    // DELETE /api/kanban/cards/{id}
    deleteCard: async (cardId: string): Promise<void> => {
        await apiClient.delete(`/kanban/cards/${cardId}`);
    }
};
