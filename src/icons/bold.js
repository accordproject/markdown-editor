import React from 'react';

import * as tips from '../FormattingToolbar/toolbarTooltip';

export const type = () => `Bold (${tips.MOD}+B)`;

export const height = () => '25px';

export const width = () => '25px';

export const padding = () => '5px 7px';

export const vBox = () => '0 0 11 13';

export const icon = fillColor => (
  <g
    stroke="none"
    strokeWidth="1"
    fill="none"
    fillRule="evenodd"
    fontFamily="IBMPlexSans-Bold, IBM Plex Sans"
    fontSize="18"
    fontWeight="bold"
  >
    <g transform="translate(-440.000000, -48.000000)" fill={fillColor}>
      <text>
        <tspan x="439" y="61">
          B
        </tspan>
      </text>
    </g>
  </g>
);
