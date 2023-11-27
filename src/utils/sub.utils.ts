import { ApiResponse } from './api.utils';
import { client } from './redis.utils';
import { Response, response } from 'express';

class SseService {

    private static instance: SseService;
    private static clientMap: Map<string, Response> = new Map<string, Response>();

    private constructor(){}

    public static getInstance(): SseService {
        if (!SseService.instance) {
            SseService.instance = new SseService();
        }
        return SseService.instance;
    }

    static async serverEventResponse(memberId: string, response: Response): Promise<void> {
        const responseData: boolean = this.clientMap.has(memberId);

        if(!responseData){
            this.clientMap.set(memberId, response);
            // Header Config
            response.setHeader('Content-Type', 'text/event-stream');
            response.setHeader('Cache-Control', 'no-cache');
            response.setHeader('Connection', 'keep-alive');
            response.setHeader('Access-Control-Allow-Origin', '*');
            response.flushHeaders();

            // SSE 시작 메시지 전송
            response.write('CONNECT');
            
            response.on('close', () => { 
                this.clientMap.delete(memberId);
            });
        }else{
            response.send('NOT');
        }
    }

    static async sendNotificationToAuthor(memberId: string){
        const authorClients: Response = this.clientMap.get(memberId) as Response;
        if(authorClients){
            authorClients.write("LIKE");
        }
    }
}

export default SseService;