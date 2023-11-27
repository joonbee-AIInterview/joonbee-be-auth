import { UserRepository } from './../repository/member.repository';
import jwt from 'jsonwebtoken';
import { CustomError, ResponseToken } from './api.utils';
import { client as redisClient }  from './redis.utils';

export const TOKEN_KEY = 'test';

export interface Payload { // 구현 다 되면 사용예쩡
    id: string,
    email: string,
    password: string,
    thumbnail: string,
    loginType: string
}

export const generateToken = async (payload: Payload): Promise<ResponseToken> => { 
    //const expire: number = 7 * 24 * 60 * 60; // refreshToken 만료시간 ( 7 일 )
    
    if(!payload) throw new CustomError("Error creating OAuth token", 401);
    const userRepository: UserRepository = new UserRepository();
    const accessToken: string = jwt.sign({joonbee : payload.id}, TOKEN_KEY, { 'expiresIn' : '1h' } );
    const refreshToken: string = jwt.sign({joonbee : payload.id}, TOKEN_KEY, { 'expiresIn' : '1d' } );
    
    const existMemberData: boolean = await userRepository.existMember(payload.id, payload.email);

    // 사용자 데이터가 존재하지 않을시 예외 발생시킴
    if(!existMemberData){
        userRepository.insertMember(payload.id, payload.email, payload.password, payload.thumbnail, payload.loginType);
        throw new CustomError(payload.id,410);
    }

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
        console.error("Token verification failed:", error);
        return null;
    }
}
