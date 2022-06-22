import { NextApiRequest, NextApiResponse, NextPageContext } from 'next';
import Router from 'next/router';
import { parseCookies } from 'nookies';
import { validateToken } from './crypto';

export type Context = NextPageContext | { req: NextApiRequest, res: NextApiResponse };

interface useUserProps {
    ctx: Context,
    redirectUrl?: string;
}

export const isSSR = (ctx: Context) => {
    return ctx && ctx.req;
};

export const redirect = (ctx: Context) => ({
    to: (url: string) => {
        console.log('redirect to: ', url);
        if (isSSR(ctx) && ctx.res) {
            ctx.res.writeHead(302, { Location: url });
            ctx.res.end();
        } else {
            Router.replace(url);
        }
    }
});

export const isAdmin = ({
    ctx,
    redirectUrl = '/login'
}: useUserProps) => {
    try {
        const { ADMIN } = process.env;
        const token = parseCookies(ctx)?.token;
        const now = Date.now().toString();
        if (ADMIN && token && validateToken({
            msg: now.slice(0, 4) + '0'.repeat(now.length - 4),
            key: ADMIN,
            token
        })) {
            return true;
        }
        redirectUrl && redirect(ctx).to(redirectUrl);
        return false;
    } catch (e) {
        redirectUrl && redirect(ctx).to(redirectUrl);
        return false;
    }
};
