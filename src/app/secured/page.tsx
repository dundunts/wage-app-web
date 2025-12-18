import React from 'react';
import Link from "next/link";

function SecuredPage() {
    return (
        <div>
            <title>Secure page</title>

            <Link href={"/"}>to Home</Link>
        </div>
    );
}

export default SecuredPage;