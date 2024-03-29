import { UserRepository } from './../repository/member.repository';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { CustomError, ResponseToken } from './api.utils';
import { client as redisClient }  from './redis.utils';

export const TOKEN_KEY = 'test';

export interface Payload { // 구현 다 되면 사용예쩡
    id: string,
    email: string,
    password: string,
    thumbnail: string,
    loginType: string,
    joonbee?:string
}

export const generateToken = async (payload: Payload): Promise<ResponseToken> => { 
    //const expire: number = 7 * 24 * 60 * 60; // refreshToken 만료시간 ( 7 일 )
    
    if(!payload) throw new CustomError("Error creating OAuth token", 401);
    const userRepository: UserRepository = new UserRepository();
    const accessToken: string = jwt.sign({joonbee : payload.id}, TOKEN_KEY, { 'expiresIn' : '1h' } );
    const refreshToken: string = jwt.sign({joonbee : payload.id}, TOKEN_KEY, { 'expiresIn' : '1d' } );
    
    const existMemberData: {
        exists: boolean,    // 존재하는지
        nickName: boolean   // 닉네임이 존재하는지
    } = await userRepository.existMember(payload.id);

    // 사용자 데이터가 존재하지 않을시 예외 발생시킴
    if(!existMemberData.exists){
        userRepository.insertMember(payload.id, payload.email, payload.password, payload.thumbnail, payload.loginType);
        throw new CustomError(payload.id,410);
    }

    if(!existMemberData.nickName) throw new CustomError(payload.id, 410);

    const responseToken: ResponseToken = {
        accessToken, refreshToken
    }
    return responseToken;

  
}

export const generateTokenForNickName = async (id: string): Promise<ResponseToken> => { 
    const expire: number = 7 * 24 * 60 * 60; // refreshToken 만료시간 ( 7 일 )
    
    if(!id) throw new CustomError("Error creating OAuth token", 401);
    const accessToken: string = jwt.sign({joonbee : id}, TOKEN_KEY, { 'expiresIn' : '1h' } );
    const refreshToken: string = jwt.sign({joonbee : id}, TOKEN_KEY, { 'expiresIn' : '7d' } );
    
    try{
        const responseToken: ResponseToken = {
            accessToken, refreshToken
        }
        return responseToken;

    }catch(err){
        console.error(err);
        throw new CustomError("TOKEN ERROR", 500);
    }
}

export const verifyToken = (token: string): Payload | null => {
    try {
        const decoded = jwt.verify(token, TOKEN_KEY) as Payload;
        return decoded;
    } catch (error) {
        if(error instanceof TokenExpiredError){
            throw new CustomError('토큰이 만료되었습니다.', 401);
        }else if(error instanceof JsonWebTokenError){
            throw new CustomError('토큰이 변조되었습니다.', 401);
        }
        console.error("Token verification failed:", error);
        return null;
    }
}
