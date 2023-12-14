import { UserRepository } from './repository/member.repository';
import express, { Request, Response, Router, NextFunction } from 'express';
import kakaoRouter from './routes/kakao.routes';
import naverRouter from './routes/naver.routes';
import googleRouter from './routes/google.routes';
import loginRouter from './routes/login.routes';
import SseService from './utils/sub.utils';
import { client } from './utils/redis.utils';
import { CustomError, ApiResponse } from './utils/api.utils';
import cookieParser from 'cookie-parser';


const app = express();
const PORT = 3000;
const redisChannel: string = process.env.SUBSCRIBE_CHANNEL as string;

client.subscribe(redisChannel, (memberId) => {
    SseService.sendNotificationToAuthor(memberId);
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // 모든 origin 허용
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
  
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
});

const logRequestDetails = (req: Request, res: Response, next: NextFunction) => {
    const currentTime = new Date();
    const requestURL = req.originalUrl;

    console.log(`REQUEST TIME => ${currentTime}, REQUEST URL => ${requestURL}`);
    next();
}
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logRequestDetails);

app.use('/auth/kakao',kakaoRouter);
app.use('/auth/naver', naverRouter);
app.use('/auth/google',googleRouter);
app.use('/auth/login',loginRouter);

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    
});

app.get('/test',(req,res) => {
    const userRepository = new UserRepository();

    userRepository.findMember('13b4a').then(data => {
        
        console.log(typeof data);
        console.log(data);
        res.json('test');
    })
})

app.use((err: any, req: any, res: any, next: any) => { // Exception 비들웨어는 라우터 뒤에 위치해야한다.
    if (err instanceof CustomError) {
        const response :ApiResponse<string> = {
            status: err.statusCode,
            data: err.message
        }
        res.status(err.statusCode).json(response);
        
    } else {
        const response :ApiResponse<string> = {
            status: 500,
            data: '알 수 없는 에러임 관리자 부르셈'
        }
        console.error(err);
        res.status(500).json(response);
        
    }
});

app.listen(PORT, () => {
    console.log(`Auth Server is running on PORT:${PORT}`);
});

  