import React from 'react';

export const type = () => 'horizontal_rule';

export const height = () => '25px';

export const width = () => '25px';

export const padding = () => '5px 3px';

export const vBox = () => '0 0 24 24';

export const icon = fillColor => (
  <path
    d="M1.5,13.5h21l-6.55671e-08,-1.77636e-15c0.828427,3.62117e-08 1.5,-0.671573 1.5,-1.5c3.62117e-08,-0.828427 -0.671573,-1.5 -1.5,-1.5h-21l-6.55671e-08,1.77636e-15c-0.828427,3.62117e-08 -1.5,0.671573 -1.5,1.5c3.62117e-08,0.828427 0.671573,1.5 1.5,1.5Z"
    fill={fillColor}
  ></path>
);
