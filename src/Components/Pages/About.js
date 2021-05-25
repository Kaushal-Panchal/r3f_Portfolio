import { Html, Text } from '@react-three/drei';
import React, { useEffect,  useState } from 'react'
import { useBlock } from '../Block';
import ArmGesture from './Models/ArmGesture';
import '../../Styles/About.css'
import { useInView } from 'react-intersection-observer';


export default function About({domContent,mouse,bgColor}) {
    const { contentMaxWidth, canvasWidth, margin ,mobile,viewportHeight,viewportWidth} = useBlock();    
    const alignRight = (canvasWidth - contentMaxWidth - margin) / 2;
    const textAlign = (viewportWidth/viewportHeight)*1.5;
    const [isHovering,setIsHovering] = useState(false);
    const [refItem,inView] = useInView({
        threshold:0,
    });
    useEffect(()=>{
        inView && (document.body.style.background = bgColor);
    },[inView,bgColor]);
    return (
        <group>  
            {mobile? null 
            :<group position={[alignRight+2.5,2,0]} >
                <Text fontSize={2}
                 color={'black'}
                 
                 maxWidth={10}  position={[-textAlign,10,0]}>
                    Who am I?
                </Text>
                <ArmGesture isHovering={isHovering} mouse={mouse} scale={[0.7,0.7,0.7]} rotation={[0,-0.1,0]} />
            </group>

            }
            <Html  portal={domContent} position={mobile?[alignRight,-2,0] :[-textAlign,5,0]} fullscreen>
                    
                    <div id='01' ref={refItem}  className='container__left'>
                        
                        <div onMouseEnter={(e)=>(setIsHovering(false))} onMouseLeave={(e)=>{setIsHovering(true)}}
                          className='card__about'>
                            
                            <div className='card__about__title'>Technical Skills</div>
                            
                            <div className="wrapper">
        
                                <div className="skill">
                                    <p >Javascript</p>
                                    <div className="skill-bar skill1 wow slideInLeft animated">
                                        <span className="skill-count1"> {!mobile?"90%":null} </span>
                                    </div>
                                </div>
                                <div className="skill">
                                    <p>Java</p>
                                    <div className="skill-bar skill1 wow slideInLeft animated">
                                        <span className="skill-count1">{!mobile?"90%":null}</span>
                                    </div>
                                </div>
                                <div className="skill">
                                    <p>React JS</p>
                                    <div className="skill-bar skill2 wow slideInLeft animated">
                                        <span className="skill-count2">{!mobile?"85%":null}</span>
                                    </div>
                                </div>
                                <div className="skill">
                                    <p>DS & ALGO</p>
                                    <div className="skill-bar skill1 wow slideInLeft animated">
                                        <span className="skill-count1">{!mobile?"90%":null}</span>
                                    </div>
                                </div>
                                <div className="skill">
                                    <p>Hybrid App Development</p>
                                    <div className="skill-bar skill5 wow slideInLeft animated">
                                        <span className="skill-count5">{!mobile?"75%":null}</span>
                                    </div>
                                </div>
                                <div className="skill">
                                    <p>3D Development & Design</p>
                                    <div className="skill-bar skill6 wow slideInLeft animated">
                                        <span className="skill-count6">{!mobile?"90%":null}</span>
                                    </div>
                                </div>
                            </div>
                            <div className='card__about__title'>Personal Info</div>
                            <div className='card__about__info' >
                                Hey , I am a B.tech CSE Under-Graduate and a <br/> Full-Stack Developer! 
                                I am also good with Data Structures and Algorithms with other Core Programming Skills .
                                I am fond of building applications with better UI as well as UX. 
                                <br/><br/>
                                I am quietly confident ,naturally curious and always working on becoming a better version of myself
                                
                                
                                
                            </div>

                        </div>
                    </div>
            </Html>
            
        </group>
    )
}
