export function appPath(base:string,path:string):string {
  return `${base.replace(/\/$/,'')}${path}`;
}

export const routerBase = (base:string) => base.replace(/\/$/,'') || '/';

export function isAccountPath(path:string):boolean {
  return ['/', '/dashboard', '/onboarding', '/sign-in', '/sign-up'].includes(path)
    || path.startsWith('/sign-in/') || path.startsWith('/sign-up/');
}

export function routerPath(base:string,to:string,origin:string):string {
  const url=new URL(to,origin);
  const prefix=base.replace(/\/$/,'');
  if(url.origin!==origin)throw new Error('External account redirect refused');
  if(prefix&&url.pathname!==prefix&&!url.pathname.startsWith(`${prefix}/`))throw new Error('Account redirect outside app refused');
  return `${url.pathname.slice(prefix.length)||'/'}${url.search}${url.hash}`;
}
