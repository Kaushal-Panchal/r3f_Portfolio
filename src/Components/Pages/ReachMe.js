import { Html, Text } from '@react-three/drei';
import React, { useEffect } from 'react'
import { useInView } from 'react-intersection-observer';
import { useBlock } from '../Block';
import Waving from './Models/Waving';
import '../../Styles/ReachMe.css';
import twitter from '../../Logos/twitter.png';
import linkedin from '../../Logos/linkedin.png';
import instagram from '../../Logos/instagram.png';
import emailjs from 'emailjs-com';

export default function ReachMe({domContent,mouse,bgColor}) {
    const { contentMaxWidth, canvasWidth, margin ,mobile,viewportHeight,viewportWidth} = useBlock();    
    const alignRight = (canvasWidth - contentMaxWidth - margin) / 2;
    const textAlign = (viewportWidth/viewportHeight)*1.5;
    const [refItem,inView] = useInView({
        threshold:0,
    });
    useEffect(()=>{
        inView && (document.body.style.background = bgColor);
    },[inView,bgColor]);

    const sendEmail = (e)=>{
        e.preventDefault();
        emailjs.sendForm('service_jq1wr8s', 'template_74er5d9', e.target, 'user_fZydSTRdAs4HCVI7NdieU')
        .then((result) => {
            console.log(result.text);
        }, (error) => {
            console.log(error.text);
        });
        e.target.reset();
    }

    return (
        <group>
            {mobile? null 
            :<group position={[alignRight+2.5,2,0]} >
                <Text fontSize={2}
                 color={'black'}
                 
                 maxWidth={10}  position={[-textAlign,10,0]}>
                    Let's Connect!
                </Text>
                <Waving mouse={mouse} scale={[-1.5,1.5,1.5]} rotation={[0,0,0]}/>
            </group>
            }
            <Html portal={domContent} position={mobile?[alignRight,5,0] :[-textAlign,5,0]} fullscreen>
                <div id='03' ref={refItem}  className='container__reach'>
                    <div className='form'>
                        <form onSubmit={sendEmail}>
                            <input className="input__box"  type="text" name='name' placeholder='Name' />
                            <input className="input__box" type="email" name='email' placeholder='E-Mail'/>
                            <input className="input__box" autoComplete={"false"} type="text" name='subject' placeholder='Suject'/>
                            <textarea className="input__box" name="message" placeholder='Message' id="" cols="30" rows="8"></textarea>
                            <input  className="btn" type="submit" value="Send Message"></input>
                        </form>
                    </div>
                    <div className='socialLinks'>
                        <div className='btn__logo'>
                                <a href="https://twitter.com/_Kaushal_p">
                                    <img src={twitter} width={'35px'} height={'35px'} alt="logo"/>
                                </a> 
                        </div>
                        <div className='btn__logo'>
                                <a href="https://www.instagram.com/kaushal_panchal_/">
                                    <img src={instagram} width={'35px'} height={'35px'} alt="logo"/>
                                </a> 
                        </div>
                        <div className='btn__logo'>
                                <a href="https://www.linkedin.com/in/kaushal-panchal-a20220172/">
                                    <img src={linkedin} width={'35px'} height={'35px'} alt="logo"/>
                                </a> 
                        </div>
                    </div>
                </div>
            </Html>
            
        </group>
    )
}
