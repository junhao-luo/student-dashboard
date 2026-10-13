import {useEffect,type ReactNode} from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
export function SmoothScroll({children}:{children:ReactNode}){
  useEffect(()=>{
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const lenis=new Lenis({autoRaf:true,anchors:true});
    let modalOpen=false;
    const observeModal=()=>{const next=!!document.querySelector('dialog[open]');if(next!==modalOpen){modalOpen=next;if(next)lenis.stop();else lenis.start();}};
    const observer=new MutationObserver(observeModal);
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});observeModal();
    return()=>{observer.disconnect();lenis.destroy();};
  },[]);
  return <>{children}</>;
}
