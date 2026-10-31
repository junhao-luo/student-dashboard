import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import {ClerkProvider,SignIn,SignUp,SignOutButton,useAuth,useUser} from '@clerk/react';
import {zhTW,enUS} from '@clerk/localizations';
import {ui} from '@clerk/ui';
import {ConvexReactClient,useAction,useConvexAuth} from 'convex/react';
import {ConvexProviderWithClerk} from 'convex/react-clerk';
import {makeFunctionReference} from 'convex/server';
import {BrowserRouter,Link,Navigate,useLocation,useNavigate} from 'react-router';
import {GraduationCap,UserRound,LogOut,BookOpen,CalendarDays,FileText} from 'lucide-react';
import {LoadingState,Dropdown,Select} from './Interface';
import {LegalPages} from './Legal';
import {LocalWorkspaceProvider,LegacyImport} from './LocalWorkspace';

import {StudentProfileForm} from './StudentProfileForm';
import {appPath,routerPath,isAccountPath,routerBase} from './app-routes';
import {normalizeStudentProfile,type StudentProfile as Profile,type StudentProfileInput} from './student-profile';

const publicKey=import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string|undefined;
const endpoint=import.meta.env.VITE_CONVEX_URL as string|undefined;
const appBase=location.pathname==='/student-dashboard'||location.pathname.startsWith('/student-dashboard/')?'/student-dashboard/':'/';
const accountPath=(path:string)=>appPath(appBase,path);
const configured=!!publicKey?.startsWith('pk_')&&!!endpoint?.match(/^https:\/\/[a-z0-9-]+\.convex\.cloud$/);
const client=configured?new ConvexReactClient(endpoint!):null;
const ProfileContext=createContext<{profile:Profile|null;setProfile:(value:Profile)=>void}|null>(null);
const PreferencesContext=createContext<{onLanguageChange:(lang:'en'|'zh')=>void;onAppearanceChange:(dark:boolean)=>void}|null>(null);
const accountAppearance=(dark:boolean)=>({variables:{colorPrimary:dark?'#a9d5ca':'#235d54',colorBackground:dark?'#242c2f':'#ffffff',colorForeground:dark?'#e8eeee':'#293237',fontFamily:'Geist Variable, sans-serif',borderRadius:'10px'}});

export default function AccountBoundary(props:{zh:boolean;dark:boolean;children:ReactNode;onLanguageChange:(lang:'en'|'zh')=>void;onAppearanceChange:(dark:boolean)=>void}){
  return <PreferencesContext.Provider value={props}><BrowserRouter basename={routerBase(appBase)}><Providers {...props}/></BrowserRouter></PreferencesContext.Provider>;
}
function Providers({zh,dark,children}:{zh:boolean;dark:boolean;children:ReactNode}){
  const navigate=useNavigate();
  const appearance=useMemo(()=>accountAppearance(dark),[dark]);
  if(!client)return <AuthPage zh={zh} dark={dark}><h1>{zh?'登入設定尚未完成':'Sign-in setup is incomplete'}</h1><p>{zh?'請設定帳號服務後重試。':'Configure the account services before opening the workspace.'}</p></AuthPage>;
  return <ClerkProvider ui={ui} publishableKey={publicKey!} localization={zh?zhTW:enUS}
    routerPush={to=>navigate(routerPath(appBase,to,location.origin))} routerReplace={to=>navigate(routerPath(appBase,to,location.origin),{replace:true})}
    signInUrl={accountPath('/')} signUpUrl={accountPath('/sign-up')} signInForceRedirectUrl={accountPath('/dashboard')} signUpForceRedirectUrl={accountPath('/onboarding')}
    afterSignOutUrl={accountPath("/")} appearance={appearance}>
    <ConvexProviderWithClerk client={client} useAuth={useAuth}><SessionGate zh={zh} dark={dark}>{children}</SessionGate></ConvexProviderWithClerk>
  </ClerkProvider>;
}
function SessionGate({zh,dark,children}:{zh:boolean;dark:boolean;children:ReactNode}){
  const {isLoaded,user}=useUser();
  const {isAuthenticated,isLoading}=useConvexAuth();
  const {pathname}=useLocation();
  if(!isAccountPath(pathname))return <AuthPage zh={zh} dark={dark}><section className="not-found"><p className="eyebrow">404</p><h1>{zh?'找不到這個頁面':'Page not found'}</h1><p>{zh?'連結可能已變更，或網址輸入有誤。':'The link may have changed, or the address may be mistyped.'}</p><Link className="not-found-home" to={user?'/dashboard':'/'}>{user?(zh?'返回工作區':'Back to workspace'):(zh?'返回首頁':'Back to home')}</Link></section></AuthPage>;
  if(!isLoaded)return <LoadingState zh={zh}/>;
  if(!user){
    if(pathname==='/')return <AuthPage zh={zh} dark={dark} hero><SignIn key={zh?'zh':'en'} appearance={accountAppearance(dark)} routing="hash" signUpUrl={accountPath('/sign-up')} forceRedirectUrl={accountPath('/dashboard')}/></AuthPage>;
    if(pathname==='/sign-up'||pathname.startsWith('/sign-up/'))return <AuthPage zh={zh} dark={dark} hero><SignUp key={zh?'zh':'en'} appearance={accountAppearance(dark)} routing="path" path={accountPath('/sign-up')} signInUrl={accountPath('/')} forceRedirectUrl={accountPath('/onboarding')}/></AuthPage>;
    if(pathname==='/sign-in'||pathname.startsWith('/sign-in/'))return <AuthPage zh={zh} dark={dark} hero><SignIn key={zh?'zh':'en'} appearance={accountAppearance(dark)} routing="path" path={accountPath('/sign-in')} signUpUrl={accountPath('/sign-up')} forceRedirectUrl={accountPath('/dashboard')}/></AuthPage>;
    return <Navigate to="/" replace/>;
  }
  if(isLoading)return <LoadingState zh={zh} label={zh?'正在驗證登入…':'Verifying sign-in…'}/>;
  if(!isAuthenticated)return <AuthPage zh={zh} dark={dark}><h1>{zh?'無法連接帳號':'Could not connect your account'}</h1><p role="alert">{zh?'後端尚未確認登入，請檢查連線後重試。':'The backend could not confirm sign-in. Check your connection and retry.'}</p><button onClick={()=>location.reload()}>{zh?'重試':'Retry'}</button><SignOutButton><button>{zh?'登出':'Sign out'}</button></SignOutButton></AuthPage>;
  return <ProfileGate key={user.id} zh={zh} dark={dark}>{children}</ProfileGate>;
}
function ProfileGate({zh,dark,children}:{zh:boolean;dark:boolean;children:ReactNode}){
  const {user}=useUser();
  const get=useAction(makeFunctionReference<'action',{},Profile|null>('profiles:get'));
  const [profile,setProfile]=useState<Profile|null|undefined>();
  const [attempt,setAttempt]=useState(0),[error,setError]=useState(false);
  const {pathname}=useLocation();
  useEffect(()=>{let active=true;setError(false);void get({}).then(value=>{if(active)setProfile(value);}).catch(()=>{if(active)setError(true);});return()=>{active=false;};},[get,attempt]);
  if(error)return <AuthPage zh={zh} dark={dark}><h1>{zh?'無法讀取學生資料':'Could not load your student profile'}</h1><p role="alert">{zh?'請檢查連線後重試。':'Check your connection and retry.'}</p><button onClick={()=>setAttempt(attempt+1)}>{zh?'重試':'Retry'}</button><SignOutButton><button>{zh?'登出':'Sign out'}</button></SignOutButton></AuthPage>;
  if(profile===undefined)return <LoadingState zh={zh}/>;
  const context={profile,setProfile};
  if(!profile){
    if(pathname!=='/onboarding')return <Navigate to="/onboarding" replace/>;
    return <ProfileContext.Provider value={context}><AuthPage zh={zh} dark={dark}><ProfileEditor zh={zh}/><SignOutButton><button>{zh?'登出':'Sign out'}</button></SignOutButton></AuthPage></ProfileContext.Provider>;
  }
  if(pathname!=='/'&&pathname!=='/dashboard')return <Navigate to="/dashboard" replace/>;
  return <ProfileContext.Provider value={context}><LocalWorkspaceProvider account={`${endpoint}|${user!.id}`}>{children}</LocalWorkspaceProvider></ProfileContext.Provider>;
}
function AuthPage({zh,dark,children,hero=false}:{zh:boolean;dark:boolean;children:ReactNode;hero?:boolean}){
  const {onLanguageChange,onAppearanceChange}=useContext(PreferencesContext)!;
  return <div className={`auth-page ${hero?'auth-landing':''} ${dark?'dark':''}`}><header className="auth-brand"><GraduationCap aria-hidden="true"/><span>CourseDock</span><div className="auth-preferences"><Select aria-label={zh?'語言':'Language'} value={zh?'zh':'en'} onChange={event=>onLanguageChange(event.target.value as 'en'|'zh')}><option value="en">English</option><option value="zh">繁體中文</option></Select><Select aria-label={zh?'外觀':'Appearance'} value={dark?'dark':'light'} onChange={event=>onAppearanceChange(event.target.value==='dark')}><option value="light">{zh?'淺色':'Light'}</option><option value="dark">{zh?'深色':'Dark'}</option></Select></div></header><div className={hero?'auth-layout':''}>
    {hero&&<section className="auth-hero" aria-labelledby="hero-title"><p className="eyebrow">{zh?'逢甲大學 · 學生工作區':'Feng Chia University · Student workspace'}</p><h1 id="hero-title">{zh?<>把學期安排好，<br/>留點時間給自己。</>:<>Keep your semester<br/>in order.</>}</h1><p className="hero-description">{zh?'課程筆記、每週課表、作業與考試，放在同一個工作區。不必在一堆分頁裡找下一件事。':'Keep course notes, weekly classes and deadlines together. Spend less time finding what comes next.'}</p>
      <div className="hero-preview" aria-hidden="true"><div className="hero-preview-head"><span><CalendarDays size={17}/>{zh?'一週安排':'Your week'}</span><small>{zh?'工作區示意':'Workspace preview'}</small></div><div className="hero-week"><div><small>{zh?'星期一':'Monday'}</small><div className="hero-class lavender"><BookOpen size={16}/><strong>{zh?'演算法':'Algorithms'}</strong><span>09:10–10:00</span></div></div><div><small>{zh?'星期二':'Tuesday'}</small><div className="hero-class peach"><BookOpen size={16}/><strong>{zh?'設計概論':'Design foundations'}</strong><span>13:10–15:00</span></div></div><div><small>{zh?'星期三':'Wednesday'}</small><div className="hero-class mint"><FileText size={16}/><strong>{zh?'實驗報告':'Lab report'}</strong><span>{zh?'整理筆記':'Review your notes'}</span></div></div></div><div className="hero-preview-note"><FileText size={18}/><div><strong>{zh?'筆記就在課程裡':'Notes belong with your courses'}</strong><span>{zh?'上課重點、附件與資料，一起整理。':'Ideas, attachments and reading, kept together.'}</span></div></div></div>
    </section>}
    <main className="auth-content">{!hero&&<p className="eyebrow">Feng Chia University</p>}{children}<p className="auth-note">{zh?'開發預覽：課程與行事紀錄可於檢查後同步；筆記、資源及檔案仍保留於此裝置。':'Development preview: courses and planner can sync after review. Notes, resources and files remain on this device.'}</p></main></div><LegalPages zh={zh}/></div>;
}
export function AccountPanel({zh}:{zh:boolean;dark:boolean}){
  const {user}=useUser();
  return <section className="account-panel"><h2>{zh?'帳號與學生資料':'Account and student profile'}</h2><p className="muted">{zh?'學生資料儲存於 Convex；課程與行事紀錄可於檢查後同步。筆記、資源及檔案仍留在此裝置，登出不會清除本機資料。':'Your student profile is stored in Convex. Courses and planner can sync after review. Notes, resources and files stay on this device; signing out does not erase them.'}</p><div className="account-actions"><span>{user?.primaryEmailAddress?.emailAddress}</span><SignOutButton><button>{zh?'登出':'Sign out'}</button></SignOutButton></div><ProfileEditor zh={zh}/><LegacyImport zh={zh} onImported={()=>location.reload()}/></section>;
}
export function AccountMenu({zh,onEdit}:{zh:boolean;onEdit:()=>void}){
  const {user}=useUser();
  const [failedImage,setFailedImage]=useState(false);
  useEffect(()=>setFailedImage(false),[user?.imageUrl]);
  const {profile}=useContext(ProfileContext)!;
  const name=profile?.name??(zh?'個人資料':'Profile');
  const initials=Array.from(name.trim()).slice(0,2).join('').toUpperCase();
  return <div className="sidebar-profile"><Dropdown label={name} icon={<span className="avatar" aria-hidden="true">{user?.hasImage&&!failedImage?<img src={user.imageUrl} alt="" referrerPolicy="no-referrer" onError={()=>setFailedImage(true)}/>:initials}</span>}><div className="profile-menu-heading"><strong>{name}</strong><span>{zh?'我的帳號':'My account'}</span></div><button onClick={onEdit}><UserRound size={17} aria-hidden="true"/>{zh?'編輯個人資料':'Edit profile'}</button><SignOutButton><button><LogOut size={17} aria-hidden="true"/>{zh?'登出':'Log out'}</button></SignOutButton></Dropdown></div>;
}
export function AccountSignOut({zh}:{zh:boolean}) {
  return <SignOutButton><button>{zh?'登出':'Log out'}</button></SignOutButton>;
}
function ProfileEditor({zh}:{zh:boolean}){
  const {profile,setProfile}=useContext(ProfileContext)!;
  const save=useAction(makeFunctionReference<'action',{profile:StudentProfileInput},null>('profiles:save'));
  return <StudentProfileForm zh={zh} profile={profile} onSave={async value=>{await save({profile:value});setProfile(normalizeStudentProfile(value)!);}}/>;
}
