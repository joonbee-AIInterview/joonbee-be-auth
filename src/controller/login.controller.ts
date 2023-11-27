import { UserRepository } from "../repository/member.repository"
import { CustomError, ResponseToken } from "../utils/api.utils";
import { generateTokenForNickName } from "../utils/jwt.utils";
import { verify } from "jsonwebtoken";

export const loginAuthentication = async (id: string, nickName: string): Promise<ResponseToken> => {
    const userRepository = new UserRepository();
    const existData = await userRepository.existMemberByNickName(nickName);

    if(existData){
        throw new CustomError('이미 존재하는 닉네임입니다.', 400);
    }

    await userRepository.updateNickname(id, nickName);
    const authToken = await generateTokenForNickName(id);
    return authToken;
}

export const refreshVerify = async (token: string): Promise<boolean> => {
    verify    
    return true;
} 