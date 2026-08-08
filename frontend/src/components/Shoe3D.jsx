import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const SHOE_MODEL_URL = '/models/shoe/MaterialsVariantsShoe.gltf';

export default function Shoe3D({ fallbackImage = '', fallbackAlt = '3D shoe' }) {
  const mountRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || failed) return;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(0, 0.8, 4.7);
    camera.lookAt(0, 0.35, 0);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (err) {
      console.warn('WebGL unavailable, using fallback image:', err);
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);

    const lights = new THREE.Group();
    const ambient = new THREE.AmbientLight(0xffffff, 0.45);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x0a0a0a, 0.5);
    const key = new THREE.DirectionalLight(0xffffff, 2.0);
    key.position.set(3.5, 5, 3.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 12;
    key.shadow.camera.left = -3;
    key.shadow.camera.right = 3;
    key.shadow.camera.top = 3;
    key.shadow.camera.bottom = -3;
    const fill = new THREE.DirectionalLight(0xff6a35, 0.9);
    fill.position.set(-4, 2, -3);
    const rim = new THREE.DirectionalLight(0xe5ff00, 0.5);
    rim.position.set(0, 3.5, -5);
    lights.add(ambient, hemi, key, fill, rim);
    scene.add(lights);

    const shadowPlane = new THREE.Mesh(
      new THREE.CircleGeometry(1.1, 48),
      new THREE.ShadowMaterial({ opacity: 0.42 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.001;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    const group = new THREE.Group();
    scene.add(group);

    let clock;
    let raf;
    let disposed = false;

    const loader = new GLTFLoader();
    loader.load(
      SHOE_MODEL_URL,
      gltf => {
        const shoe = gltf.scene;
        shoe.traverse(o => {
          if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
          }
        });
        const box = new THREE.Box3().setFromObject(shoe);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const scale = 2.1 / Math.max(size.x, size.y, size.z);
        shoe.scale.setScalar(scale);
        shoe.position.set(
          -center.x * scale,
          -center.y * scale,
          -center.z * scale
        );
        const radius = box.getBoundingSphere(new THREE.Vector3()).radius * scale;
        shadowPlane.scale.setScalar(Math.max(radius * 2.4, 0.6));
        group.add(shoe);
      },
      undefined,
      () => {
        if (!disposed) setFailed(true);
      }
    );

    clock = new THREE.Clock();
    const animate = () => {
      if (disposed) return;
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      group.rotation.y = -t * 0.375;
      group.position.y = Math.sin(t * 1.3) * 0.06;
      renderer.render(scene, camera);
    };
    animate();

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      scene.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
            if (m.map) m.map.dispose();
            if (m.normalMap) m.normalMap.dispose();
            if (m.aoMap) m.aoMap.dispose();
            m.dispose();
          });
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [failed]);

  if (failed) {
    return (
      <img
        src={fallbackImage}
        alt={fallbackAlt}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    );
  }

  return (
    <div
      ref={mountRef}
      aria-label={fallbackAlt}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    />
  );
}
