import * as signalR from '@microsoft/signalr';

class SignalRService {
    private connection: signalR.HubConnection | null = null;

    public async startConnection(token: string) {
        this.connection = new signalR.HubConnectionBuilder()
            // .withUrl('http://localhost:5000/hubs/kanban', { // Vite проксирует /hubs -> backend
            .withUrl('https://api.shulgan-lab.ru/hubs/kanban', { 
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        try {
            await this.connection.start();
            console.log('SignalR Connected');
        } catch (err) {
            console.error('SignalR Connection Error: ', err);
        }
    }

    public async joinEvent(eventId: string) {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            await this.connection.invoke('JoinBoard', eventId);
        }
    }
    
    public async leaveEvent(eventId: string) {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            await this.connection.invoke('LeaveBoard', eventId);
        }
    }

    public stopConnection() {
        this.connection?.stop();
    }

    // Подписка на события
    public on(methodName: string, callback: (...args: any[]) => void) {
        this.connection?.on(methodName, callback);
    }

    public off(methodName: string) {
        this.connection?.off(methodName);
    }
}

export const signalRService = new SignalRService();
