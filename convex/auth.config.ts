import type {AuthConfig} from 'convex/server';
const domain=process.env.AUTH_JWT_ISSUER;
if(!domain||!domain.startsWith('https://'))throw Error('Configure an HTTPS AUTH_JWT_ISSUER before deploying the account backend.');
// Provider must issue the Convex audience; see https://docs.convex.dev/auth/clerk.
export default {providers:[{domain,applicationID:'convex'}]} satisfies AuthConfig;
