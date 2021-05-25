import { Html, Text } from '@react-three/drei';
import React, { useEffect } from 'react'
import { useInView } from 'react-intersection-observer';
import { useBlock } from '../Block';
import SittingIdle from './Models/SittingIdle';
import '../../Styles/Projects.css'
import Cards from './Cards';
import rp from '../../CardImages/React-PlayGround.png';
import chess from '../../CardImages/Chess.png';
import sd from '../../CardImages/SatsangDiksha.png';
import spartanSols from '../../CardImages/SpartanSolutions.png';
import weather from '../../CardImages/Weather.png';
import gitLogo from '../../CardImages/gitLogo.png';
import AlgoWiz from '../../CardImages/AlgoWiz.png';
export default function Projects({bgColor,mouse,domContent}) {
    const { contentMaxWidth, canvasWidth, margin ,mobile,viewportHeight,viewportWidth} = useBlock();    
    const alignRight = (canvasWidth - contentMaxWidth - margin) / 2;
    const textAlign = (viewportWidth/viewportHeight)*1.5;
    const [refItem,inView] = useInView({
        threshold:0,
    });
    useEffect(()=>{
        inView && (document.body.style.background = bgColor);
    },[inView,bgColor]);

    return (
        <>
        <group>
            {mobile?null
            :<group>
                <Text fontSize={mobile?0.75:1.5}
                 color={'black'}
                 
                 maxWidth={12}  position={[-alignRight,13,0]}>
                    Projects!
                </Text>
                <SittingIdle mouse={mouse} position={[-alignRight-2.5,0,0]}/>
            </group>
            }
            <Html portal={domContent} position={mobile?[alignRight,-2,0] :[textAlign+0.5,5,0]} fullscreen >
                <div id='02' ref={refItem}  className='container__right'>
                    <div className="card__outer">
                        <div className="row">
                            <div className="col">
                                <Cards title={'PlayGround'} 
                                link={'https://kaushal-panchal.github.io/react-PlayGround/'} 
                                image={rp}
                                > A React JS based app for school students to multi tasking! Like - Calculator , Notes etc. </Cards>
                            </div>    
                            <div className="col">
                                <Cards title={'Chess'} 
                                link={'https://github.com/Kaushal-Panchal/react-Chess'} 
                                image={chess}
                                > A Multiplayer chess game build using React for front-end and Firebase for back-end </Cards>
                            </div>
                            <div className="col">
                                <Cards title={'Spartan Solutions'} 
                                    link={'https://elated-dubinsky-64510d.netlify.app/'} 
                                    image={spartanSols}
                                > Personal static website with a cool UI and fast Routing  </Cards>
                            </div>     
                            <div className="col">
                            
                                <Cards title={'Algorithm Visualizer'} 
                                    link={'https://github.com/Kaushal-Panchal/AlgoWiz'} 
                                    image={AlgoWiz}
                                > An android app made with flutter which visualises algorithms  </Cards>
                            </div>   
                            <div className="col">
                                <Cards title={'Weather App'} 
                                    link={'https://github.com/Kaushal-Panchal/Weather-App-Flutter-'} 
                                    image={weather}
                                > An application which fetches weather api and displays on a beautiful UI build in flutter   </Cards>
                            </div>   
                            <div className="col">
                                <Cards title={'SDTracker'} 
                                    link={'https://github.com/Kaushal-Panchal/reactNative-SDTracker'} 
                                    image={sd}
                                > An android application which has a user base of 30 people , Created for personal use  </Cards>
                            </div>   
                             
                            <div className="col">
                                <a href="https://github.com/Kaushal-Panchal/">
                                    <img src={gitLogo} alt="logo"/>
                                </a>
                                
                            </div>   
                            
                            
                        </div>
                        
                    </div>
                </div>
            </Html>

        </group>
        </>
    )
}
