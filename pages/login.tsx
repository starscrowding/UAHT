import { FormEvent, useCallback, useState } from 'react';
import { NextPage } from 'next';
import { Input } from '@nextui-org/react';
import { useRouter } from 'next/router';
import { post, ENDPOINT } from '../hooks/api';

const Login: NextPage = () => {
    const router = useRouter();
    const [input, setInput] = useState('');
    const onSubmit = useCallback(async (e: FormEvent) => {
        e && e.preventDefault();
        try {
            const hmacSHA512 = (await import('crypto-js/hmac-sha512')).default;
            const Base64 = (await import('crypto-js/enc-base64')).default;
            const now = Date.now().toString();
            const msg = now.slice(0, 4) + '0'.repeat(now.length - 4);
            const token = Base64.stringify(hmacSHA512(msg, input));
            const result = await post(ENDPOINT.token.set, token);
            if (result && result.ok) {
                router.push('/admin');
            }
        } catch (error) {
            console.log(error);
        }
    }, [input, router]);

    return <form onSubmit={onSubmit}>
        <Input id="token"
            placeholder="Token"
            clearable
            bordered
            width="100%"
            css={{ p: '$10' }}
            onChange={e => setInput(e?.target?.value || '')} />
    </form>;
};

export default Login;
