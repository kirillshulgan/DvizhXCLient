import apiClient from './client';

// Типы DTO (лучше вынести их в types/index.ts, но можно и здесь объявить для наглядности)
export interface EventBriefDto {
    id: string;
    title: string;
    description: string;
    startDate: string; // ISO строка
    status: number;
    boardId: string;   // Важно для перехода на Канбан
    role: string;      // Например, "Owner" или "Member"
}

export interface EventDto {
    id: string;
    title: string;
    description: string;
    startDate: string;
    status: number;
    inviteCode: string;
    inviteLink: string;
    boardId: string;
    participants: any[]; // Можно уточнить тип ParticipantDto
}

export const eventService = {

    // 1. Получить список моих событий
    // GET /api/events
    getMyEvents: async () => {
        const response = await apiClient.get<EventBriefDto[]>('/events');
        return response.data;
    },

    // 2. Получить детали события
    // GET /api/events/{id}
    getEventById: async (id: string) => {
        const response = await apiClient.get<EventDto>(`/events/${id}`);
        return response.data;
    },

    // 3. Создать новое событие
    // POST /api/events
    createEvent: async (title: string, description: string, startDate: string) => {
        // Контроллер возвращает EventDto (или ID, CreatedAtAction возвращает объект в теле)
        // В твоем коде: `return CreatedAtAction(..., id);` - это вернет ID в теле ответа.
        // Но лучше проверить swagger, обычно CreatedAtAction возвращает созданный объект, если он передан вторым параметром.
        // У тебя `CreatedAtAction(..., new { id }, id)` -> вернет просто ID (Guid) в теле.
        const response = await apiClient.post<string>('/events', {
            title,
            description,
            startDate
        });
        return response.data;
    },

    // 4. Вступить в событие по коду
    // POST /api/events/join/{code}
    joinEvent: async (code: string) => {
        const response = await apiClient.post<{ eventId: string }>(`/events/join/${code}`);
        return response.data;
    },

    // 5. Сгенерировать новую ссылку-приглашение
    // POST /api/events/{id}/regenerate-invite
    regenerateInviteLink: async (id: string) => {
        const response = await apiClient.post<{ inviteLink: string }>(`/events/${id}/regenerate-invite`);
        return response.data;
    }
};
