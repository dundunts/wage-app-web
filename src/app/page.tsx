'use client';
import {signIn, signOut, useSession} from "next-auth/react";
import Link from "next/link";
import {Button} from "@chakra-ui/react";

export default function Home() {
    const {data: session} = useSession()
    if (session && !session.error) {
        return (
            <>
                Signed in as {session.user?.email} <br/>
                Access token: {session.accessToken} <br/>
                <button onClick={() => signOut()}>Sign out</button>

                <br/><br/>
                Roles: {session.realmRoles}

                <br/><br/>
                Greetings:
                <GreetingButton/>

                <br/><br/>
                Secured:
                <SecuredButton/>

                <br/><br/>
                <Navigation/>
            </>
        )
    }
    return (
        <>
            Not signed in <br/>
            <button onClick={() => signIn()}>Sign in</button>

            <br/><br/>
            Greetings:
            <GreetingButton/>

            <br/><br/>
            Secured:
            <SecuredButton/>

            <br/><br/>
            <Navigation/>
        </>
    )
}

function Navigation() {
    return (
        <div>
            <title>Navigation:</title>
            <ul>
                <li><Link href='/secured'>to Secured</Link></li>
                <li><Link href='/public'>to Public</Link></li>
                <li><Link href='/admin'>to Admin</Link></li>
            </ul>
        </div>
    )
}

function GreetingButton() {
    const handleClick = async () => {
        const res = await fetch("/api/external/greeting");
        const data = await res.json();
        console.log(data);
    };

    return <Button onClick={handleClick}>Load greeting</Button>;
}

function SecuredButton() {
    const handleClick = async () => {
        const res = await fetch("/api/external/secured");
        const data = await res.json();
        console.log(data);
    };

    return <Button onClick={handleClick}>Load secured</Button>;
}