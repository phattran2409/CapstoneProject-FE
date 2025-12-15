// BACKUP: Version không dùng three-stdlib (nếu có vấn đề)
import React from 'react';
import { ViewStyle } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
// @ts-ignore - three.js types issue with React Native
import * as THREE from 'three';

export type FieldPlayer = {
  id: string;
} | null;

interface Field3DViewProps {
  players: FieldPlayer[];
  style?: ViewStyle;
}

const SLOT_POSITIONS = [
  // @ts-ignore
  new THREE.Vector3(0, 0, 4),    // GK
  // @ts-ignore
  new THREE.Vector3(-3, 0, 1.5), // LB
  // @ts-ignore
  new THREE.Vector3(3, 0, 1.5),  // RB
  // @ts-ignore
  new THREE.Vector3(-1.5, 0, -2),// LW
  // @ts-ignore
  new THREE.Vector3(1.5, 0, -2), // RW
];

const Field3DView: React.FC<Field3DViewProps> = ({ players, style }) => {
  return (
    <GLView
      style={[{ width: '100%', height: 260 }, style]}
      onContextCreate={async (gl: ExpoWebGLRenderingContext) => {
        // Get canvas dimensions
        const width = (gl as any).drawingBufferWidth || 375;
        const height = (gl as any).drawingBufferHeight || 260;

        // @ts-ignore
        // Create WebGL Renderer using expo-gl context
        const renderer = new THREE.WebGLRenderer({
          canvas: {
            width,
            height,
            style: {},
            addEventListener: () => {},
            removeEventListener: () => {},
            clientHeight: height,
            clientWidth: width,
            getContext: () => gl,
            toDataURL: () => '',
          } as any,
          context: gl as any,
        });
        
        renderer.setSize(width, height);
        renderer.setClearColor('#050505');

        // @ts-ignore
        // Scene & camera
        const scene = new THREE.Scene();
        // @ts-ignore
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
        camera.position.set(0, 8, 10);
        camera.lookAt(0, 0, 0);

        // @ts-ignore
        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        // @ts-ignore
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        scene.add(directionalLight);

        // @ts-ignore
        // Sân đơn giản
        const fieldGeometry = new THREE.PlaneGeometry(10, 16);
        // @ts-ignore
        const fieldMaterial = new THREE.MeshStandardMaterial({ color: 0x0b3d0b });
        // @ts-ignore
        const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
        field.rotation.x = -Math.PI / 2;
        scene.add(field);

        // @ts-ignore
        // Markers cho từng slot
        const markerGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        // @ts-ignore
        const markerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff66 });

        players.forEach((player, index) => {
          if (!player) return; // slot trống -> không render
          const pos = SLOT_POSITIONS[index] ?? SLOT_POSITIONS[0];
          // @ts-ignore
          const marker = new THREE.Mesh(markerGeometry, markerMaterial.clone());
          marker.position.copy(pos);
          scene.add(marker);
        });

        // Loop render
        const renderLoop = () => {
          requestAnimationFrame(renderLoop);
          renderer.render(scene, camera);
          gl.endFrameEXP();
        };
        renderLoop();
      }}
    />
  );
};

export default Field3DView;

