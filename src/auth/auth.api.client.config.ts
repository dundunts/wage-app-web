import axios from "axios";

const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL ?? ""
const keycloakRealm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? "WageApp"

export const axiosKeycloakClient = axios.create({
    baseURL: `${keycloakUrl}/realms/${keycloakRealm}`
})
