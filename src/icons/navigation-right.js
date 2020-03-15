import React from 'react';

import * as tips from '../FormattingToolbar/toolbarTooltip';

export const type = () => 'redo';

export const label = () => `Redo (${tips.MOD}+⇧+Z)`;

export const height = () => '25px';

export const width = () => '25px';

export const padding = () => '6px 4px';

export const vBox = () => '0 0 16 11';

export const icon = fillColor => (
  <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
    <g
      transform="translate(-798.000000, -49.000000)"
      fill={fillColor}
      fillRule="nonzero"
    >
      <g transform="translate(806.000000, 54.500000) scale(-1, 1) translate(-806.000000, -54.500000) translate(798.000000, 49.000000)">
        <path d="M12.6900078,2.56651697 C10.3793397,1.21662262 7.20333777,1.40331718 3.9020024,3.06569321 L3.9020024,3.06569321 C3.83767696,3.09793767 3.75978898,3.0856688 3.70866895,3.03523948 L1.70466772,1.05309937 L1.70466772,1.05309938 C1.31280015,0.666625095 0.679640428,0.668791281 0.290460188,1.05793716 C0.104299407,1.24408355 -0.000123324148,1.49582065 -1.32407326e-06,1.75816755 L-1.32407326e-06,9.57020939 L-1.32407325e-06,9.57020949 C-1.26847808e-06,9.93584284 0.298475526,10.2322469 0.666665753,10.2322469 L8.52800392,10.2322469 L8.52800393,10.2322469 C9.08028893,10.2324955 9.52820454,9.78809065 9.52845788,9.23964095 C9.52857821,8.97599977 9.42312381,8.72313192 9.23533769,8.53676904 L7.56867,6.88167543 L7.56867001,6.88167544 C7.53082585,6.84450879 7.51322324,6.79157545 7.52133665,6.73933739 L7.52133664,6.73933741 C7.52975585,6.68706208 7.56265947,6.6418577 7.61000337,6.61752252 C9.50800453,5.65293397 11.5146724,5.49205887 12.9246733,6.24347137 C14.066674,6.84658748 14.6666744,7.99787059 14.6666744,9.56888545 L14.6666744,9.56888555 C14.6666744,9.9345189 14.9651512,10.230923 15.3333415,10.230923 C15.7015317,10.2309229 16.0000085,9.9345189 16.0000085,9.56888555 C16.0000085,6.30173076 14.8246745,3.81445608 12.6900065,2.5665155 L12.6900078,2.56651697 Z"></path>
      </g>
    </g>
  </g>
);
