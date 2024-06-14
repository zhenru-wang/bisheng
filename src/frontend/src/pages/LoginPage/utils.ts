import { getPublicKeyApi } from "@/controllers/API/user";
import { JSEncrypt } from 'jsencrypt';

export const handleEncrypt = async (pwd: string): Promise<string> => {
    const { public_key } = await getPublicKeyApi();
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(public_key);
    return encrypt.encrypt(pwd) as string;
};

export const PWD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/