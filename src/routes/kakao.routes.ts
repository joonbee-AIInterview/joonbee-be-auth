import { Router, Request, Response } from 'express';
import { kakaoAuthentication } from '../controller/kakao.controller';
import { ApiResponse, asyncErrorHandler } from '../utils/api.utils';

//test

import * as JWT from '../utils/jwt.utils';

const router = Router();

router.get('/callback', asyncErrorHandler(
    async (req: Request, res: Response) => {
        const { code } = req.query;
        const authToken = await kakaoAuthentication(code as string);
    
        const response: ApiResponse<string> = {
            status: 200,
            data: '성공'
        }
        
        res.cookie('joonbee-token', authToken.accessToken, { httpOnly: false, sameSite: 'none', secure: true });
        res.cookie('joonbee-token-refresh', authToken.refreshToken, { httpOnly: true, sameSite: 'none', secure: true });
        res.json(response);
    }
));

export default router;
