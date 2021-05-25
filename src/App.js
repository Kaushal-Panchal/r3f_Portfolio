
import { Html, useProgress } from '@react-three/drei';
import { Suspense, useEffect, useRef } from 'react';
import { Canvas } from 'react-three-fiber';
import './App.css';
import { Block, useBlock } from './Components/Block';
import Header from './Components/Header';
import About from './Components/Pages/About';
import Home from './Components/Pages/Home';
import { getMousePos } from './Components/Pages/Models/Utils';
import Projects from './Components/Pages/Projects';
import ReachMe from './Components/Pages/ReachMe';
import state from './Components/Store';

function Plane({ color = "white", map, ...props }) {
  return (
    <mesh {...props}>
      <planeBufferGeometry attach="geometry" />
      <meshBasicMaterial attach="material" color={color} map={map} />
    </mesh>
  )
}
const Stripe = ({color})=> {
  const { contentMaxWidth } = useBlock();
  return (
    <>
      <Plane scale={[100, contentMaxWidth/2, 1]} rotation={[0, 0, Math.PI / 4]} position={[0, 0, -25]} color={color} />
    </>
  );
}

const Light = ()=>{
  return(
    <>
      <ambientLight intensity={0.2} />
      <directionalLight  position={[10,50,10]}  intensity={1} color={'coral'} />
      <directionalLight  position={[-50,50,10]}  intensity={0.5}  />
    </>
  );
}

function App() {
  const scrollArea = useRef();
  const domContent = useRef();
  const mouse = useRef({x:0,y:0});
  
  const onScroll = (e)=>{
    state.top.current = e.target.scrollTop;
  }
  useEffect(()=>{
    onScroll({target:scrollArea.current});
  },[] )
  function Loader() {
    const { progress } = useProgress()
    
    return (
      <Html center >
        <div  style={{height:`${100}vh`,backgroundColor:'black',
        width:'100vw',textAlign:'center',color:'coral',fontSize:'25px',display:'flex',alignItems:'center',justifyContent:'center'}} >
          <div>{Math.floor(progress) }% Loaded</div>
        </div>
      </Html>
    )
  }
  return (
    <>
      <Header/>
      <Canvas className="canvas" orthographic camera={{ zoom: state.zoom, position: [0, 0, 500] }}>
          <Light/>
          <Suspense fallback={<Loader/> }>
              {/* Stripe */}
              <Block factor={-1.0} offset={1}>
                <Stripe  color={"pink"} />
              </Block>
              {/* Home */}
              <Block factor={1.5} offset={0}>
                <Home bgColor={'#ff9974'} domContent={domContent}/>
              </Block>
              {/* About */}
              <Block factor={2.0} offset={1} >
                
                <About bgColor={'tan'} mouse={mouse} domContent={domContent}/>
              </Block>
              <Block factor={1.5} offset={2} >
                <Projects bgColor={'#007d8f'} mouse={mouse} domContent={domContent} />
              </Block>
              <Block factor={2} offset={3.25} >
                <ReachMe bgColor={'coral'} mouse={mouse} domContent={domContent} />
              </Block>
          </Suspense>
      </Canvas>
      <div className="scrollArea" ref={scrollArea} onMouseMove={(e) => (mouse.current=getMousePos(e))} onScroll={onScroll} >
        <div style={{position:'sticky',top:0}} ref={domContent}  ></div>
        <div style={{height:`${state.pages*100}vh`}}  >
        </div>
      </div>
    </>
  );
}

export default App;
