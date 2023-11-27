import e from 'express';
import { CustomError } from '../utils/api.utils';
import pool from '../utils/database.utils';
import { RowDataPacket } from 'mysql2';

type Member =  {
    id: string,
    email: string,
    password: string,
    thumbnail: string,
    login_type: string,
    del_flag: boolean,
    created_at: Date,
    updated_at: Date,
    nick_name: string
}

export class UserRepository {
    
    async insertMember(id: string, email: string, password: string, thumbnail: string, type: string): Promise<void> {
        const client = await pool.getConnection();
        try{
            const queryText = `INSERT INTO member(id, email, password, thumbnail, login_type, nick_name) 
            VALUES(?, ?, ?, ?, ?, '')`;

            await client.query(queryText, [id, email, password, thumbnail, type]);
        }catch(err){
            console.error(err);
            throw new CustomError("insertMember ERROR member.repository 12", 500);
        }finally {
            client.release(); // 연결 반환
        }
    }

    async existMember(id: string, email: string): Promise<boolean>{
        const client = await pool.getConnection();

       try{
            const query = `SELECT count(*) as cnt, nick_name as nickName FROM member WHERE id = ? AND email = ?`;
            const [rows] = await client.query(query, [id, email]) as RowDataPacket[];
            
            const count = rows[0].cnt;
            const nickName = rows[0].nickName;
            console.log(rows);
            return count && nickName;
            
        }catch(err){
            console.error(err);
            throw new CustomError("existMember ERROR member.repository 31", 500);
       } finally {
            client.release(); // 연결 반환
       }
    }

    async findMember(id: string): Promise<Member>{
        const client = await pool.getConnection();

        try{
            const queryText = 'SELECT * FROM member WHERE id = ?';
            const [rows] = await pool.query(queryText,[ id ]) as RowDataPacket[];

            return rows[0] as Member;
            
        }catch(err){
            console.error(err);
            throw new CustomError("findMember ERROR member.repository 37", 500);
        } finally {
            client.release(); // 연결 반환
        }
    }
    async updateNickname(id: string, newNickname: string): Promise<void> {
        const client = await pool.getConnection();
    
        try {
            const queryText = 'UPDATE member SET nick_name = ? WHERE id = ?';
            await pool.query(queryText, [newNickname, id]);
        } catch (err) {
            console.error(err);
            throw new CustomError("updateNickname ERROR member.repository 77", 500);
        } finally {
            client.release(); // 연결 반환
        }
    }
    async existMemberByNickName( nickName: string): Promise<boolean>{
        const client = await pool.getConnection();

       try{
            const query = `SELECT count(*) as cnt FROM member WHERE nick_name = ?`;
            const [rows] = await client.query(query, [ nickName ]) as RowDataPacket[];
            const count = rows[0].cnt;

            return count;
            
        }catch(err){
            console.error(err);
            throw new CustomError("existMember ERROR member.repository 31", 500);
       } finally {
            client.release(); // 연결 반환
       }
    }
}