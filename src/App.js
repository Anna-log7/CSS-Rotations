import React, { useState } from 'react';
import Quaternion from 'quaternion';
import { dot, cross } from 'mathjs';
import './App.scss';

function App() {
  const untranslatedRadius = 500/2; // half of shortest viewport size
  
  const [isDragging, setIsDragging] = useState(false);

  const [startQuaternion, setStartQuaternion] = useState(new Quaternion(1, 0, 0, 0));
  const [quaternion, setQuaternion] = useState(new Quaternion(1, 0, 0, 0));

  const [mouseDownVector, setMouseDownVector] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const [mouseMoveVector, setMouseMoveVector] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const translateViewportTo3D = (event, radius) => {
    const halfDocHeight = document.documentElement.scrollHeight/2
    const halfDocWidth = document.documentElement.scrollWidth/2

    const viewportX = event.pageX - halfDocWidth;
    const viewportY = -(event.pageY - halfDocHeight);

    // Normalize to a sphere of radius 1
    const sphereX = viewportX / radius;
    const sphereY = viewportY / radius;

    let sphereZ = 1 - Math.pow(sphereX, 2) - Math.pow(sphereY, 2);

    sphereZ = sphereZ > 0 ? Math.sqrt(sphereZ) : 0;
    
    return {
      sphereX,
      sphereY,
      sphereZ,
    };
  };

  const calculateAngle = (vec1, vec2) => {
    const dotProduct = dot(vec1, vec2);
    const magnitude1 = Math.sqrt(vec1.reduce((accumulator, val) => (
      accumulator + Math.pow(val, 2)
    ), 0));
    const magnitude2 = Math.sqrt(vec2.reduce((accumulator, val) => (
      accumulator + Math.pow(val, 2)
    ), 0));

    return Math.sqrt(Math.pow(magnitude1, 2) * Math.pow(magnitude2, 2)) + dotProduct;
  };

  const rotate = (event) => {
    const { sphereX, sphereY, sphereZ } = translateViewportTo3D(
      event,
      untranslatedRadius,
    );

    setMouseMoveVector({
      x: sphereX,
      y: sphereY,
      z: sphereZ,
    });

    const angle = calculateAngle(
      Object.values(mouseDownVector),
      Object.values(mouseMoveVector),
    );

    const axis = cross(
      Object.values(mouseDownVector),
      Object.values(mouseMoveVector),
    );

    const deltaQuaternion = (new Quaternion(angle, axis)).normalize();
    setQuaternion(deltaQuaternion.mul(startQuaternion.normalize()));
  };

  const handleMouseMove = (event) => {
    if (isDragging) {
      rotate(event);
    }
  };

  const dragStart = (event) => {
    const { sphereX, sphereY, sphereZ } = translateViewportTo3D(
      event,
      untranslatedRadius,
    );

    setMouseDownVector({
      x: sphereX,
      y: sphereY,
      z: sphereZ,
    });
    setIsDragging(true);
  };

  const dragEnd = (event) => {
    setIsDragging(false);
    const { sphereX, sphereY, sphereZ } = translateViewportTo3D(
      event,
      untranslatedRadius,
    );

    setMouseMoveVector({
      x: sphereX,
      y: sphereY,
      z: sphereZ,
    });

    const angle = calculateAngle(
      Object.values(mouseDownVector),
      Object.values(mouseMoveVector),
    );

    const axis = cross(
      Object.values(mouseDownVector),
      Object.values(mouseMoveVector),
    );

    const deltaQuaternion = (new Quaternion(angle, axis)).normalize();
    setStartQuaternion(deltaQuaternion.mul(startQuaternion.normalize()));
  };

  return (
    <div
      className="app"
    >
      <div
        className="viewport"
        onMouseDown={dragStart}
        onMouseUp={dragEnd}
        onMouseMove={handleMouseMove}
      >
        <div
          className="box"
          style={{
            transform: `matrix3d(${quaternion.toMatrix4()})`
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
    </div>
  );
}

export default App;
