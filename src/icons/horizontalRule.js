import React from 'react';

export const type = () => 'horizontal_rule';

export const height = () => '25px';

export const width = () => '25px';

export const padding = () => '5px 3px';

export const vBox = () => '0 0 20 17';

export const icon = fillColor => (
  <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
    <g transform="translate(-615.000000, -48.000000)" fill={fillColor}>
      <text>
        <tspan x="620" y="61">
          —
        </tspan>
      </text>
    </g>
  </g>
);
