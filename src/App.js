import React, { useState } from 'react';
import Quaternion from 'quaternion';
import { dot, cross } from 'mathjs';
import './App.scss';

function App() {
  const [isDragging, setIsDragging] = useState(false);

  const [startQuaternion, setStartQuaternion] = useState(new Quaternion(1, 0, 0, 0));
  const [currentQuaternion, setCurrentQuaternion] = useState(new Quaternion(1, 0, 0, 0));

  const [mouseDownVector, setMouseDownVector] = useState([0, 0, 0]);

  const translateViewportTo3D = (event) => {
    const radius = document.documentElement.scrollHeight < document.documentElement.scrollWidth
      ? document.documentElement.scrollHeight
      : document.documentElement.scrollWidth; // diameter value makes this smoother as quaternion rotations are doubled
    const halfDocHeight = document.documentElement.scrollHeight/2
    const halfDocWidth = document.documentElement.scrollWidth/2

    const viewportX = event.pageX - halfDocWidth;
    const viewportY = -(event.pageY - halfDocHeight);

    // Normalize to a sphere of radius 1
    const sphereX = viewportX / radius;
    const sphereY = viewportY / radius;

    let sphereZ = 1 - Math.pow(sphereX, 2) - Math.pow(sphereY, 2);

    sphereZ = sphereZ > 0 ? Math.sqrt(sphereZ) : 0;
    
    return [
      sphereX,
      sphereY,
      sphereZ,
    ];
  };

  const rotate = (event) => {
    if (isDragging) {
      const mouseMoveVector = translateViewportTo3D(
        event,
      );

      let angle = dot(
        mouseDownVector,
        mouseMoveVector,
      );

      let axis = cross(
        mouseDownVector,
        mouseMoveVector,
      );

      const deltaQuaternion = (new Quaternion(angle, axis)).normalize();

      setCurrentQuaternion(deltaQuaternion.mul(startQuaternion.normalize()));
    }
  };

  const dragStart = (event) => {
    const mouseMoveVector = translateViewportTo3D(
      event,
    );

    setMouseDownVector(mouseMoveVector);
    setIsDragging(true);
  };

  const dragEnd = (event) => {
    setIsDragging(false);
    setStartQuaternion(currentQuaternion.normalize());
  };

  return (
    <div
      className="app"
      onMouseDown={dragStart}
      onMouseUp={dragEnd}
      onMouseMove={rotate}
    >
      <div
        className="box"
        style={{
          transform: `matrix3d(${currentQuaternion.toMatrix4()})`
        }}
      >
        <div
          className="box__front"
        />
        <div
          className="box__back"
        />
        <div
          className="box__top"
        />
        <div
          className="box__bottom"
        />
        <div
          className="box__right"
        />
        <div
          className="box__left"
        />
      </div>
    </div>
  );
}

export default App;
