import { useRef, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import Albedo from "@/assets/Albedo.jpg";
import Ocean from "@/assets/Ocean.png";
import earth from "@/assets/earth2.jpg";
import { Color, DoubleSide, FrontSide, TextureLoader } from "three";
import type { Group, Mesh } from "three";

export function Earth() {
  /**
   * Three textures, three bindings.
   *
   * This destructured four — `[color, normal, specular, clouds]` — from a list
   * of three, so `clouds` was always `undefined` and the cloud sphere below
   * rendered untextured. There is no cloud image in `src/assets`, so the layer
   * is now a plain translucent shell rather than a broken texture lookup.
   */
  const [color, normal, specular] = useLoader(TextureLoader, [Albedo, earth, Ocean]);

  const earthRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);

  // Fixed values. They were `useState` pairs whose setters were never called,
  // so nothing could ever change them.
  const scale = 1;
  const [autoRotate] = useState(true);

  useFrame(({ clock }) => {
    if (autoRotate && earthRef.current) {
      earthRef.current.rotation.y = clock.getElapsedTime() / 6;
    }
  });

  return (
    <>
      <OrbitControls
        enableZoom
        enablePan
        enableRotate
        zoomSpeed={0.6}
        rotateSpeed={0.4}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        minDistance={1.5}
        maxDistance={10}
      />

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <directionalLight position={[-5, 5, 5]} intensity={1.0} castShadow />

      <group ref={groupRef} scale={scale}>
        <mesh ref={earthRef}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshPhongMaterial
            map={color}
            bumpMap={normal}
            bumpScale={0.1}
            specularMap={specular}
            specular={new Color(0x222222)}
            shininess={12}
            side={FrontSide}
          />
        </mesh>

        {/* Atmospheric shell. Give it `map` once a cloud texture exists. */}
        <mesh>
          <sphereGeometry args={[1.005, 64, 64]} />
          <meshPhongMaterial
            transparent
            opacity={0.12}
            depthWrite={false}
            side={DoubleSide}
          />
        </mesh>
      </group>

      <Stars radius={500} depth={60} count={5000} factor={4} fade />
    </>
  );
}

export default Earth;
