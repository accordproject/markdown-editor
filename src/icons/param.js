import React from 'react';

export const type = () => 'variable';

export const height = () => '24px';

export const width = () => '25px';

export const padding = () => '6px 3px';

export const vBox = () => '0 0 19 12';

const x = '{x}';

export const icon = fillColor => (
    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" fontFamily="ArialRoundedMTBold, Arial Rounded MT Bold" fontSize="11.5" fontWeight="normal" letterSpacing="-0.819999993">
        <g id="contract---clause-edit-within-contract-editor" transform="translate(-652.000000, -49.000000)" fill={fillColor}>
            <text id="[{x}]">
                <tspan x="652" y="58">[{x}</tspan>
                <tspan x="667.632109" y="58">]</tspan>
            </text>
        </g>
    </g>
);
