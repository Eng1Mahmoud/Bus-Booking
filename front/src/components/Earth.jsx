import { useRef, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import Albedo from "../assets/Albedo.jpg"; 
import Ocean from "../assets/Ocean.png"; 
import earth from "../assets/earth2.jpg";
import { Color, DoubleSide, TextureLoader } from "three";
import { FrontSide } from "three";

export function Earth(props) {
  const [color, normal, specular, clouds] = useLoader(
    TextureLoader,
    [Albedo,earth,Ocean] // Use textures in correct order
  );

  const earthRef = useRef();
  const groupRef = useRef();
  const [scale, setScale] = useState(1);
  const [autoRotate, setAutoRotate] = useState(true);

  useFrame(({ clock }) => {
    if (autoRotate && earthRef.current) {
      earthRef.current.rotation.y = clock.getElapsedTime() / 6;
    }
  });

  return (
    <>
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        zoomSpeed={0.6}
        rotateSpeed={0.4}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        minDistance={1.5}
        maxDistance={10}
      />

      {/* Improved lighting setup */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <directionalLight
        position={[-5, 5, 5]}
        intensity={1.0}
        castShadow
      />

      <group ref={groupRef} scale={scale}>
        {/* Earth sphere */}
        <mesh ref={earthRef}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshPhongMaterial
            map={color} // Albedo texture
            bumpMap={normal} // Normal map
            bumpScale={0.1}
            specularMap={specular} // Specular map
            specular={new Color(0x222222)}
            shininess={12} // Adjust shininess for better reflection
            side={FrontSide}
          />
        </mesh>

        {/* Cloud layer - must use transparent PNG */}
        <mesh>
          <sphereGeometry args={[1.005, 64, 64]} />
          <meshPhongMaterial
            map={clouds} // Cloud texture
            transparent
            opacity={0.4}
            depthWrite={false}
            side={DoubleSide}
          />
        </mesh>
      </group>

      <Stars radius={500} depth={60} count={5000} factor={4} fade />
    </>
  );
}