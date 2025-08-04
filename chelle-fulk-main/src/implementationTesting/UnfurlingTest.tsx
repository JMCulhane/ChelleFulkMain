// src/components/UnfurlingTest.tsx
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function UnfurlingTest() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Blank_scroll.png/640px-Blank_scroll.png',
      (texture) => {
        const geometry = new THREE.PlaneGeometry(6, 4, 60, 1);
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide,
          transparent: true,
        });

        const mesh = new THREE.Mesh(geometry, material);

        const pos = geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const z = Math.sin((x / 6) * Math.PI) * 1.2;
          pos.setZ(i, z);
        }
        pos.needsUpdate = true;

        mesh.rotation.x = -Math.PI / 2;
        scene.add(mesh);

        let rotation = -Math.PI / 2;

        const animate = () => {
          requestAnimationFrame(animate);
          if (rotation < 0) {
            rotation += 0.02;
            mesh.rotation.x = rotation;
          }
          renderer.render(scene, camera);
        };

        animate();
      },
      undefined,
      (error) => {
        console.error('Failed to load texture:', error);
      }
    );

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 z-0" />;
}
