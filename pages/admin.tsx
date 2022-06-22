import { useEffect, useState } from 'react';
import { NextPage, NextPageContext } from 'next';
import { isAdmin } from '@space/hooks/route';

const Admin: NextPage = () => {
    const [step, setStep] = useState('');

    const updateStep = (nextStep: string) => {
        setStep(nextStep);
        window.location.hash = nextStep;
    };

    useEffect(() => {
        const hash = window?.location?.hash;
        if (hash) {
            setStep(hash.substring(1));
        }
    }, []);

    return (<div>
        Admin
    </div>);
};

export async function getServerSideProps(ctx: NextPageContext) {
    const admin = isAdmin({ ctx });
    return { props: { admin } };
}

export default Admin;
