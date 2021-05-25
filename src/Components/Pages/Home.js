import { Html } from '@react-three/drei'
import React, { useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer';
import { useFrame } from 'react-three-fiber';
import { useBlock } from '../Block'
import HeadWithGoggles from './Models/HeadWithGoggles'


export default function Home({domContent,bgColor}) {
    const { contentMaxWidth, canvasWidth, margin ,mobile,viewportHeight,viewportWidth} = useBlock();
    const alignRight = (canvasWidth - contentMaxWidth - margin) / 2;
    const ref = useRef();
    const textAlign = (viewportWidth/viewportHeight)*1.5;
    const scale = (viewportWidth/viewportHeight)+0.5;
    useFrame(()=>{
        ref.current.rotation.y += 0.008;
        
    })
    const [refItem,inView] = useInView({
        threshold:0,
    });
    useEffect(()=>{
        inView && (document.body.style.background = bgColor);
    },[inView,bgColor]);
    return (
        <>
        <group>
            
            <group position={mobile?[-alignRight,0,0] :[-alignRight-2.5,0,0]}>
                
                <group ref={ref}>
                    <HeadWithGoggles  scale={ [scale,scale,scale] } position={mobile?[0,1,0] :[0, 0, 0]} />
                </group>
            </group>
            <Html  portal={domContent} position={mobile?[alignRight,-2,0] :[textAlign,0,0]} fullscreen>
                    <div id='00' ref={refItem} className='container__right'>
                        <div className='intro__title'>
                            Not any, <br/> <span style={{color:'purple'}} >Regular</span>  <br/> Software Developer!
                        </div>
                    </div>
            </Html>
        </group>
        </>
    )
}
