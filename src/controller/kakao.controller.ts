import axios from 'axios';
import * as JWT from '../utils/jwt.utils';
import dotenv from 'dotenv';
import * as crypto from 'crypto';
import { CustomError, ResponseToken } from '../utils/api.utils';

dotenv.config();

export const kakaoAuthentication = async (code: string): Promise<ResponseToken> => {
    const clientId: string = process.env.KAKAO_CLIENTID as string;
    const clientSecret: string = process.env.KAKAO_CLIENTSECRET as string;
    const KAKAO_TOKEN_URL: string = process.env.KAKAO_TOKEN_URL as string;
    const KAKAO_USERINFO_URL: string = process.env.KAKAO_USERINFO_URL as string;

    const sha256Hash = crypto.createHash('sha256');
    const tempPwd = "1234";

    const { data } = await axios.post(KAKAO_TOKEN_URL, null,{
        params: {
            grant_type: 'authorization_code',
            client_id: clientId,
            client_secret: clientSecret,
            code: code
        },
        headers: {
            'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        }
    });
    const accessToken = data.access_token;

    const userInfoRequest = await axios.get(KAKAO_USERINFO_URL,{
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const userData = userInfoRequest.data.kakao_account;
    // 프로필 사진은 필수동의함
    let payLoad: JWT.Payload = {
        id: userInfoRequest.data.id,
        email: userData.email,
        password: sha256Hash.update(tempPwd).digest('hex'),
        thumbnail: userData.profile.thumbnail_image_url,
        loginType: 'KAKAO'
    }
    payLoad = handleNullCheck(payLoad);

    const token: ResponseToken = await JWT.generateToken(payLoad);
    return token;
  
}

const handleNullCheck = (payLoad: JWT.Payload): JWT.Payload => {
    if(payLoad.id == null ) throw new CustomError('id 존재하지 않음', 401);
    
    return {
        id : payLoad.id !== null ? payLoad.id : 'NONE',
        email : payLoad.email !== null ? payLoad.email : 'NONE',
        password : payLoad.password !== null ? payLoad.password : 'NONE',
        thumbnail : payLoad.thumbnail !== null ? payLoad.thumbnail : 'NONE', 
        loginType: 'KAKAO'
    };
}

