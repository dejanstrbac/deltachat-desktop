import React, { useState, useRef, useContext, useEffect } from 'react'
import { ScreenContext } from '../../contexts'
import { ContextMenu, MenuItem } from 'react-contextmenu'
import { Icon } from '@blueprintjs/core'
import {
  archiveChat,
  openLeaveChatDialog,
  openDeleteChatDialog,
  openBlockContactDialog,
  openEncryptionInfoDialog,
  openEditGroupDialog,
  openViewProfileDialog,
} from '../helpers/ChatMethods'

import { callDcMethodAsync } from '../../ipc'

// const log = require('../../shared/logger').getLogger('renderer/ChatListContextMenu')

const ChatListContextMenu = React.memo(
  props => {
    const screenContext = useContext(ScreenContext)
    const { showArchivedChats } = props
    const [chat, setChat] = useState({ isGroup: false })
    const [showEvent, setShowEvent] = useState(null)
    const contextMenu = useRef(null)

    const show = (event, chat) => {
      // no log.debug, because passing the event object to through ipc freezes the application
      // console.debug('ChatListContextMenu.show', chat, event) // also commented out because it's not needed

      /*
     This is a workaround because react-contextmenu
     has no official programatic way of opening the menu yet
     https://github.com/vkbansal/react-contextmenu/issues/259
    */
      event.preventDefault()
      event.stopPropagation()
      const position = { x: event.clientX, y: event.clientY }
      const ev = { detail: { id: 'chat-options', position } }
      setChat(chat)
      setShowEvent(ev)
    }

    useEffect(() => {
      props.getShow(show)
    }, [])
    useEffect(() => {
      if (showEvent) contextMenu.current.handleShow(showEvent)
    })

    const reset = () => {
      setShowEvent(null)
      setChat({})
    }

    const onArchiveChat = archive => archiveChat(chat.id, archive)
    const onDeleteChat = () => openDeleteChatDialog(screenContext, chat)
    const onEncrInfo = () => openEncryptionInfoDialog(screenContext, chat)
    const onEditGroup = async () => {
      const fullChat = await callDcMethodAsync(
        'chatList.getFullChatById',
        chat.id
      )
      openEditGroupDialog(screenContext, fullChat)
    }
    const onViewProfile = async () => {
      const fullChat = await callDcMethodAsync(
        'chatList.getFullChatById',
        chat.id
      )
      openViewProfileDialog(screenContext, fullChat.contacts[0])
    }
    const onLeaveGroup = () => openLeaveChatDialog(screenContext, chat.id)
    const onBlockContact = () => openBlockContactDialog(screenContext, chat)

    const tx = window.translate

    const menu = [
      showArchivedChats ? (
        <MenuItem onClick={() => onArchiveChat(false)} key='export'>
          <Icon icon='export' /> {tx('menu_unarchive_chat')}
        </MenuItem>
      ) : (
        <MenuItem
          icon='import'
          onClick={() => onArchiveChat(true)}
          key='import'
        >
          <Icon icon='import' /> {tx('menu_archive_chat')}
        </MenuItem>
      ),
      <MenuItem onClick={onDeleteChat} key='delete'>
        <Icon icon='delete' /> {tx('menu_delete_chat')}
      </MenuItem>,
      !chat.isGroup && !chat.isDeviceTalk && (
        <MenuItem onClick={onEncrInfo} key='info'>
          <Icon icon='lock' /> {tx('encryption_info_desktop')}
        </MenuItem>
      ),
      chat.isGroup && chat.selfInGroup && (
        <>
          <MenuItem onClick={onEditGroup} key='edit'>
            <Icon icon='edit' /> {tx('menu_edit_group')}
          </MenuItem>
          <MenuItem onClick={onLeaveGroup} key='leave'>
            <Icon icon='log-out' /> {tx('menu_leave_group')}
          </MenuItem>
        </>
      ),
      !chat.isGroup && (
        <MenuItem onClick={onViewProfile} key='view'>
          <Icon icon='log-out' /> {tx('menu_view_profile')}
        </MenuItem>
      ),
      !chat.isGroup && !(chat.isSelfTalk || chat.isDeviceTalk) && (
        <MenuItem onClick={onBlockContact} key='block'>
          <Icon icon='blocked-person' /> {tx('menu_block_contact')}
        </MenuItem>
      ),
    ]

    return (
      <ContextMenu id='chat-options' ref={contextMenu} onHide={reset}>
        {menu}
      </ContextMenu>
    )
  },
  (prevProps, nextProps) => {
    const shouldRerender =
      prevProps.showArchivedChats !== nextProps.showArchivedChats
    return !shouldRerender
  }
)

export default ChatListContextMenu
