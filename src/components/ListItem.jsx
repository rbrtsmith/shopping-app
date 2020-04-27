import React from 'react'
import { styled } from '@moonpig/launchpad-utils'
import { system as s } from '@moonpig/launchpad-system'

const StyledListItemInner = styled.li`
${({ theme, isActive }) => s({
  mb: 4,
  position: 'relative',
  border: `2px solid ${theme.colors.borderThree}`,
  bgcolor: 'white',
  borderRadius: 2,
  zIndex: isActive ? 10 : 0,
})}
`

const StyledOverlay = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
  background-color: #f8f8f9;
  opacity: 0;
  transition: opacity 0.2s;

  &.is-active {
    pointer-events: inherit;
    opacity: 0.75;
  }
`

export const StyledListItem = ({ isActive, children }) => (
  <li>
    <StyledOverlay className={isActive ? 'is-active' : ''} />
    <StyledListItemInner isActive={isActive}>{children}</StyledListItemInner>
  </li>
)

export const StyledListItemSelectButton = styled.button`
${s({
  position: 'relative',
  px: 6,
  fontFamily: 'inherit',
  height: '48px',
  lineHeight: '48px',
  width: '100%',
  textAlign: 'left',
  border: 0,
  fontSize: 'inherit',
  color: 'inherit',
})}

  svg {
    position: absolute;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
  }
`
