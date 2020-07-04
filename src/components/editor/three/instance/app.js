import * as React from 'react';
import ThreePoint from './threepoint'

const data = new Array(10000).fill(0).map((d, id) => ({ id }));

export default function App() {

  return (
      <ThreePoint
        data={data}
      />
  );
}
