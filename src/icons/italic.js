import React from 'react';

import * as tips from '../FormattingToolbar/toolbarTooltip';

export const type = () => 'Italic(' + tips.MOD + '+I)';

export const height = () => '25px';

export const width = () => '25px';

export const padding = () => '5px 7px';

export const vBox = () => '0 0 10 13';

export const icon = fillColor => (
  <g
    stroke="none"
    strokeWidth="1"
    fill="none"
    fillRule="evenodd"
    fontFamily="IBMPlexSans-BoldItalic, IBM Plex Sans"
    fontSize="18"
    fontStyle="italic"
    fontWeight="bold"
  >
    <g transform="translate(-477.000000, -48.000000)" fill={fillColor}>
      <text>
        <tspan x="478" y="61">
          I
        </tspan>
      </text>
    </g>
  </g>
);
