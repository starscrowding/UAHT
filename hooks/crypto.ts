import hmacSHA512 from 'crypto-js/hmac-sha512';
import Base64 from 'crypto-js/enc-base64';

export const generateToken = ({ msg, key }: { msg: string, key: string }): string => {
    if (!msg || !key) {
        throw new Error('Message and key are required');
    }

    return Base64.stringify(hmacSHA512(msg, key));
};

export const validateToken = (
    { token, msg, key }: {
        token: string,
        msg: string,
        key: string
    }
): boolean => {
    if (!msg || !key) {
        throw new Error('Message and key are required');
    }

    return generateToken({ msg, key }) === token;
};
