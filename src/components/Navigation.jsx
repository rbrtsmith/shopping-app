import React, { useState, useEffect } from 'react'
import { NavLink } from "react-router-dom";
import { styled, breakpointDown, breakpoint, css } from '@moonpig/launchpad-utils'
import { system as s } from '@moonpig/launchpad-system'
import { useHistory } from 'react-router-dom'


const StyledNavLink = styled(NavLink)`
  &.active {
    background-color: ${({ theme }) => theme.colors.ctaTwo};
    color: white;
  }
`

const POSITION_TOP = 0
const POSITION_MIDDLE = 1
const POSITION_BOTTOM = 2

const StyledBurgerLine = styled.span`
  ${({ isOpen, position }) => {
    if (!isOpen) return {}
    const rotation = '45deg'
    const top = '7px'

    switch (position) {
      case POSITION_TOP:
        return css`
          top: ${top};
          transform: rotate(${rotation});
        `
      case POSITION_MIDDLE:
        return css`
          opacity: 0;
          transform: rotate(${rotation});
        `
      case POSITION_BOTTOM:
        return css`
          top: -${top};
          transform: rotate(-${rotation});
        `
      default:
        return null
    }
  }}
`

const StyledToggle = styled.button`
  height: 40px;
  width: 40px;
  text-indent: -999px;
  line-height: 0;

  ${breakpoint('md')} {
    transform: translate3d(0, -50%, 0);
    top: 50%;
  }

  .line {
    ${s({ bgcolor: 'textOne' })}
    position: relative;
    display: block;
    width: 18px;
    height: 2px;
    margin: 5px auto 5px;
    border-radius: 2px;
    transition: transform 0.3s, opacity 0.3s;
    user-select: none;
  }
`

const StyledToggleWrapper = styled.div`
  height: 42px;
  ${breakpoint('md')} {
    display: none;
  }

  font-size: 0;
`

const Toggle = ({ isOpen, onClick, as }) => (
  <StyledToggleWrapper>
    <StyledToggle
      onClick={onClick}
      aria-haspopup
      aria-expanded={isOpen}
      aria-controls="mega-nav-content"
      as={as}
      isOpen={isOpen}
      data-testid="lp-nav-meganav-toggle"
    >
      {`${isOpen ? 'Close' : 'Open'} menu`}
      {[POSITION_TOP, POSITION_MIDDLE, POSITION_BOTTOM].map(position => (
        <StyledBurgerLine
          key={position}
          className="line"
          position={position}
          isOpen={isOpen}
        />
      ))}
    </StyledToggle>
  </StyledToggleWrapper>
)



const StyledNav = styled.nav`
  background-color: white;
  ${({ theme }) => s({
    borderBottom: `2px solid ${theme.colors.borderThree}`,
  })}
  ul {
    display: flex;
  }
  li {
    flex: 1;
    line-height: 40px;
  }

  ${breakpoint('md')} {
    max-width: 1200px;
    box-sizing: content-box;
    padding-left: 24px;
    padding-right: 24px;
    text-align: center;
    > * {
      box-sizing: border-box;
    }
  }

  ${breakpointDown('md')} {
    position: relative;

    ul {
      display: block;
      position: absolute;
      top: 42px;
      left: 0;
      width: 100%;
      background-color: white;
      height: calc(100vh - 42px);
      z-index: 1;
      transform: translateX(${({ isOpen }) => isOpen ? '0' : '-100%'});
      transition: transform 0.3s;
      ${({ theme }) => s({
        borderBottom: `2px solid ${theme.colors.borderThree}`,
        borderTop: `2px solid ${theme.colors.borderThree}`
      })}

    }
    li {
      ${({ theme }) => s({
        borderBottom: `2px solid ${theme.colors.borderThree}`
      })}
      &:last-child {
        border-bottom: 0;
      }
    }
    a {
      display: block;
      ${s({ px: 6 })}
    }
  }
`


export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const history = useHistory()

  useEffect(() => {
    history.listen(() => {
      setTimeout(() => {
        setIsOpen(false)
      }, 200)
    })
  }, [history])
  return (
    <StyledNav isOpen={isOpen}>
      <Toggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      <ul>
        <li>
          <StyledNavLink exact to="/">Home</StyledNavLink>
        </li>
        <li>
          <StyledNavLink to="/create">Create new list</StyledNavLink>
        </li>
        <li>
          <StyledNavLink to="/edit">Edit current lists</StyledNavLink>
        </li>
          <li>
          <StyledNavLink to="/shop">Shop current lists</StyledNavLink>
        </li>
        <li>
          <StyledNavLink to="completed-lists">Completed Lists</StyledNavLink>
        </li>
      </ul>
    </StyledNav>
  )
}
