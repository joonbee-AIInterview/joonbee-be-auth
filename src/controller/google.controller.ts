import axios from "axios";
import * as JWT from '../utils/jwt.utils';
import * as crypto from 'crypto';
import { CustomError, ResponseToken } from "../utils/api.utils";

export const googleAuthentication = async (code: string): Promise<ResponseToken> => {
     const clientId: string = process.env.GOOGLE_CLIENTID as string;
     const clientSecret: string = process.env.GOOGLE_CLIENTSECRET as string;
     const GOOGLE_TOKEN_URL: string = process.env.GOOGLE_TOKEN_URL as string;
     const GOOGLE_USERINFO_URL: string = process.env.GOOGLE_USERINFO_URL as string;
     const REDIRECT_URI: string = process.env.REDIRECT_URI as string;

     const sha256Hash = crypto.createHash('sha256');
     const tempPwd = "1234";

     const { data } = await axios.post(GOOGLE_TOKEN_URL, {
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: REDIRECT_URI,
          code: code,
     });
     const accessToken = data.access_token;
     const userInfoRequest = await axios.get(GOOGLE_USERINFO_URL, {
          headers: {
               Authorization: `Bearer ${accessToken}`,
          },
     });
     console.log(userInfoRequest.data);

     let payLoad: JWT.Payload = {
          id: userInfoRequest.data.id,
          email: userInfoRequest.data.email,
          password: sha256Hash.update(tempPwd).digest('hex'),
          thumbnail: userInfoRequest.data.picture,
          loginType: 'GOOGLE'
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
         loginType: 'GOOGLE'
     };
 }