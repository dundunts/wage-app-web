// export interface Permission {
//     id: string;
//     value: string;
//     authority: string;
// }

export interface JwtPayload {
    sub: string;
    email: string;
    realm_access: {
        roles: string[]
    };
    resource_access: {
        "account": {
            "roles": string[]
        }
    };
    iat: number; // issued at
    exp: number; // expiration
    typ: string;
    name: string;
    preferred_username: string;
    given_name: string;
    family_name: string;
}
