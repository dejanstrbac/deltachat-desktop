import React from 'react'
import classNames from 'classnames'
import { ContactName as ContactNameConversations } from '../conversations'
import styled from 'styled-components'

export function renderAvatar (avatarPath, color, displayName) {
  if (avatarPath) {
    return (
      <img
        className='module-conversation-list-item__avatar'
        src={avatarPath}
      />
    )
  }

  const codepoint = displayName.codePointAt(0)
  const initial = codepoint ? String.fromCodePoint(codepoint).toUpperCase() : '#'

  return (
    <AvatarBubble color={color}>
      {initial}
    </AvatarBubble>
  )
}

export function AvatarBubble(props) {
  return (
    <div
      style={{ backgroundColor: props.color, ...props.style }}
      className={classNames(
        'module-conversation-list-item__avatar',
        'module-conversation-list-item__default-avatar'
      )}
    >
      {props.children}
    </div>
  )
}

export function VerifiedIcon (props) {
  return (
    <img
      className='module-conversation-list-item__is-verified'
      src='../images/verified.png'
      style={props.style}
    />
  )
}

const ContactNameWrapper = styled.div`
  height: 54px;
  margin-left: 20px;
`

const ContactNameDisplayName = styled.p`
  font-weight: bold;
  margin-bottom: 0px;
  margin-top: 3px;
`

const ContactNameEmail = styled.p`
  color: var(--contactEmailColor);
  margin-bottom: 3px;
  margin-top: 3px;
`

export function ContactName (displayName, address, isVerified) {
  return (
    <ContactNameWrapper>
      <ContactNameDisplayName>
        {displayName}
        {isVerified && <VerifiedIcon style={{ marginLeft: '4px' }} />}
      </ContactNameDisplayName>
      <ContactNameEmail>{address}</ContactNameEmail>
    </ContactNameWrapper>
  )
}

const ContactWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`
export default function Contact (props) {
  const { id, avatarPath, color, displayName, address, isVerified } = props.contact
  return (
    <ContactWrapper>
      {renderAvatar(avatarPath, color, displayName)}
      {ContactName(displayName, address, isVerified)}
    </ContactWrapper>
  )
}

const PseudoContactText = styled.p`
  padding-top: calc((54px - 18px) / 2);
  font-weight: bold;
`
export function PseudoContact (props) {
  const { cutoff, text, subText } = props
  return (
    <ContactWrapper>
      {props.children ? props.children : renderAvatar(false, false, cutoff)}
      { !subText && <ContactNameWrapper><PseudoContactText>{text}</PseudoContactText></ContactNameWrapper> }
      { subText && ContactName(text, subText, false) }
    </ContactWrapper>
  )
}