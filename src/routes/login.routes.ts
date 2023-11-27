import { Payload } from './../utils/jwt.utils';
import { Router, Request, Response, response } from 'express';
import { loginAuthentication } from '../controller/login.controller';
import { ApiResponse, CustomError, asyncErrorHandler } from '../utils/api.utils';
import { verifyToken, TOKEN_KEY } from '../utils/jwt.utils';
import { userInfo } from 'os';
import SseService from '../utils/sub.utils';
import { JwtPayload, verify, sign } from 'jsonwebtoken';

interface RequestBody {
    id: string,
    nickName: string
}

const router = Router();
const clients = new Map<string, Response[]>();

router.post('/nick',asyncErrorHandler(
    async (req: Request, res: Response) => {
        const data: RequestBody = req.body;
        const authToken =await loginAuthentication(data.id, data.nickName);

        const response: ApiResponse<string> = {
            status: 200,
            data: '성공'
        }
        console.log(authToken);
        res.cookie('joonbee-token', authToken.accessToken, { httpOnly: false, sameSite: 'none', secure: true });
        res.cookie('joonbee-token-refresh', authToken.refreshToken, { httpOnly: true, sameSite: 'none', secure: true });
        res.json(response);
    }
));

router.get('/refresh', asyncErrorHandler(
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies['joonbee-token-refresh'];
        try{
            const data: JwtPayload = verify(refreshToken, TOKEN_KEY) as JwtPayload;
            
            if(data){
                const id = data['joonbee'];
                const accessToken: string = sign({joonbee : id}, TOKEN_KEY, { 'expiresIn' : '1h' } );
                const refreshToken: string = sign({joonbee : id}, TOKEN_KEY, { 'expiresIn' : '1d' } );

                res.cookie('joonbee-token', accessToken, { httpOnly: false, sameSite: 'none', secure: true });
                res.cookie('joonbee-token-refresh', refreshToken, { httpOnly: true, sameSite: 'none', secure: true });
            }
            const apiResponse: ApiResponse<string> = {
                status: 200,
                data: '성공'
            }
            res.json(apiResponse);
        }catch(error){
            console.error(error);
            throw new CustomError('리프레시 토큰 만료되었습니다.',401);
        }
    }
));

/**
 * @TODO 쿠키에서 값을 빼는 방식으로 바꿔야함 현재는 테스트를 위해서 파라미터에서 뺴는 중임
 */
router.get('/events', asyncErrorHandler(
    async (req: Request, res: Response) => {
       /*
        const token = req.cookies.joonbee_token;
        if(!token) throw new CustomError('TOKEN EMPTY',401);
       */
        try{
           // const payload: Payload = verifyToken(token) as Payload;
           // const memberId: string = payload.id;

            const memberId: string = req.query.memberId as string;

            SseService.serverEventResponse(memberId, res);

        } catch (error){
            throw new CustomError('SSE ERROR ',500);
        }
    }
));



export default router;