import React from 'react';

export const type = () => 'underline';

export const height = () => '25px';

export const width = () => '25px';

export const padding = () => '3px 6px';

export const vBox = () => '0 0 13 17';

export const icon = fillColor => (
    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="contract--Formatting-toolbar" transform="translate(-512.000000, -47.000000)" fill={fillColor}>
            <g id="Underline" transform="translate(512.000000, 42.000000)">
                <text id="U" fontFamily="IBMPlexSans-Bold, IBM Plex Sans" fontSize="18" fontWeight="bold">
                    <tspan x="0" y="18">U</tspan>
                </text>
                <rect id="Rectangle" x="0" y="20" width="13" height="2"></rect>
            </g>
        </g>
    </g>
);
