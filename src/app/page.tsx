'use client';
import {signIn, signOut, useSession} from "next-auth/react";

export default function Home() {
    const { data: session } = useSession()
    if (session) {
        return (
            <>
                Signed in as {session.user?.email} <br />
                Access token: {session.accessToken} <br/>
                <button onClick={() => signOut()}>Sign out</button>

                <br/><br/>
                Greetings:
                <GreetingButton/>

                <br/><br/>
                Secured:
                <SecuredButton/>
            </>
        )
    }
    return (
        <>
            Not signed in <br />
            <button onClick={() => signIn()}>Sign in</button>

            <br/><br/>
            Greetings:
            <GreetingButton/>

            <br/><br/>
            Secured:
            <SecuredButton/>
        </>
    )
}

function GreetingButton() {
    const handleClick = async () => {
        const res = await fetch("/api/external/greeting");
        const data = await res.json();
        console.log(data);
    };

    return <button onClick={handleClick}>Load greeting</button>;
}

function SecuredButton() {
    const handleClick = async () => {
        const res = await fetch("/api/external/secured");
        const data = await res.json();
        console.log(data);
    };

    return <button onClick={handleClick}>Load secured</button>;
}