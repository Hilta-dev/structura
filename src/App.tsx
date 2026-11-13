import { Canvas } from '@react-three/fiber';
import StackScene from './scene/StackScene';
import StackControls from './components/StackControls';
import Timeline from './components/Timeline';

export default function App() {
  return (
    <div className="relative w-screen h-screen bg-gray-900">
      <Canvas camera={{ position: [0, 3, 8], fov: 50 }}>
        <StackScene />
      </Canvas>

      <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-2 p-4 bg-gray-800/90 backdrop-blur">
        <StackControls />
        <Timeline />
      </div>
    </div>
  );
}
