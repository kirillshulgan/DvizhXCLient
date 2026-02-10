export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
}

export interface Card {
    id: string;
    title: string;
    description: string;
    columnId: string;
    orderIndex: number;
    assignedUserId?: string;
}

export interface BoardColumn {
    id: string;
    title: string;
    orderIndex: number;
    cards: Card[];
}

export interface Board {
    id: string;
    title: string;
    eventId: string;
    columns: BoardColumn[];
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}

export interface LoginRequest {
    readonly email: string;
    readonly password: string;
}

export interface RegisterRequest {
    readonly email: string;
    readonly password: string;
    readonly userName: string;
}

export interface CreateCardRequest {
    readonly columnId: string;
    readonly title: string;
    readonly description?: string;
}

export interface MoveCardRequest {
    readonly cardId: string;
    readonly targetColumnId: string;
    readonly newOrderIndex: number;
}

export interface UpdateCardRequest {
    readonly title: string;
    readonly description?: string;
}