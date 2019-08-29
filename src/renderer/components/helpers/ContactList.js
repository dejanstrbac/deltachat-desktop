import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import SearchableList from '../SearchableList'
import { RenderContact } from '../Contact'
import contactsStore from '../../stores/contacts'
import { callDcMethodAsync } from '../../ipc'
import Contact, { PseudoContact } from './Contact'

const ContactListDiv = styled.div`
  .module-contact-list-item--with-click-handler {
    padding: 10px;
  }
  .module-contact-list-item--with-click-handler:hover {
    background-color: darkgrey;
  }
`

export function useContacts (listFlags, queryStr) {
  const [contacts, setContacts] = useState([])

  const updateContacts = async (listFlags, queryStr) => {
    const contacts = await callDcMethodAsync('getContacts2', [listFlags, queryStr])
    setContacts(contacts)
  }

  const assignContacts = ({ contacts }) => setContacts(contacts)
  useEffect(() => {
    updateContacts(listFlags, queryStr)
  }, [])

  return [contacts, updateContacts]
}

export default class ContactList extends SearchableList {
  constructor (props) {
    super(props)
    this.state.showVerifiedContacts = false
    this.handleSearch = this.handleSearch.bind(this)
    this.search = this.search.bind(this)
  }

  _getData () {
    const { filterFunction, contacts } = this.props
    if (!contacts || contacts.length === 0) {
      return []
    }
    let data = contacts
    if (filterFunction) {
      data = contacts.filter(filterFunction)
    }
    data = data.filter(contact =>
      `${contact.name}${contact.address}${contact.displayName}`.indexOf(this.state.queryStr) !== -1
    )
    if (this.props.showVerifiedContacts) {
      data = data.filter(contact => contact.isVerified)
    }
    return data
  }

  render () {
    return <ContactListDiv>
      {super.render()}
    </ContactListDiv>
  }

  renderItem (contact) {
    const { childProps, onContactClick } = this.props
    const props = childProps ? childProps(contact) : {}
    return <RenderContact
      key={contact.id}
      onClick={() => onContactClick(contact)}
      contact={contact}
      {...props}
    />
  }
}

const ContactListItemWrapper = styled.div`
  display: flex;
  &:hover {
    background-color: var(--chatListItemBgHover);
    cursor: pointer;
  }
`

const ContactListItemInitial = styled.div`
  min-width: 40px;
  max-width: 40px;
  height: 64px;
  text-align: center;
  font-size: 26px;
  padding-top: 23px;
  text-transform: capitalize;
  color: var(--contactListInitalColor);
`
const ContactListItemInitialSpacer = styled.div`
  min-width: 40px;
  max-width: 40px;
  height: 64px;
`
const ContactListItemContactWrapper = styled.div`
  width: 100%;
`

const ContactListItemCheckboxWrapper = styled.div`
  width: 40px;
  margin-right: 20px;
  input {
    width: 20px;
    height: 20px;
    margin-top: calc((64px - 20px) / 2);
    -webkit-appearance: none;
    border: solid;
    border-radius: 3px;
    border-width: 2px;
    border-color: grey;
    &:checked {
      border-color: blue;
      background-color: blue;
    }
    &:checked:after {
      content: '\\2714';
      font-family: monospace;
      font-size: 31px;
      top: -11px;
      left: -1px;
      position: relative;
      color: white;
    }
  }
`

export function ContactListItem (props) {
  const { contact, showInitial, onClick, showCheckbox, checked, onCheckboxClick } = props
  return (
    <ContactListItemWrapper
      key={contact.id}
      onClick={() => onClick(contact)}
    >
      {showInitial && <ContactListItemInitial>{contact.displayName[0]}</ContactListItemInitial> }
      {!showInitial && <ContactListItemInitialSpacer/> }
      <ContactListItemContactWrapper>
        <Contact contact={contact} />
      </ContactListItemContactWrapper>
      {showCheckbox &&
        <ContactListItemCheckboxWrapper>
          <input
            type="checkbox" 
            disabled={contact.id === 1}
            onClick={event => {
              event.stopPropagation()
              typeof onCheckboxClick === 'function' && onCheckboxClick(contact)
            }}
            defaultChecked={checked === true}
          />
        </ContactListItemCheckboxWrapper>
      }
    </ContactListItemWrapper>
  )
}

export function PseudoContactListItem (props) {
  const { id, cutoff, text, subText, onClick, avatar } = props
  return (
    <ContactListItemWrapper
      key={id}
      showInitial={false}
      onClick={onClick}
    >
      <ContactListItemInitialSpacer/>
      <PseudoContact cutoff={cutoff} text={text} subText={subText} avatar={avatar}>
        {props.children}
      </PseudoContact>
    </ContactListItemWrapper>
  )
}

export function ContactList2 (props) {
  const { contacts, onClick, showCheckbox, isChecked, onCheckboxClick } = props
  let currInitial = ''
  return contacts.map(contact => {
    const initial = contact.displayName[0].toLowerCase()
    let showInitial = false
    if (initial !== currInitial) {
      currInitial = initial
      showInitial = true
    }

    let checked = null
    if(showCheckbox && typeof isChecked === 'function') {
      checked = isChecked(contact)
    }
    return ContactListItem({ contact, onClick, showInitial, showCheckbox, checked, onCheckboxClick })
  })
}

export const ContactListSearchInput = styled.input`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-wrap: normal;
  -webkit-box-flex: 1;
  -ms-flex: 1 1 auto;
  flex: 1 1 auto;
  margin: 0;
  line-height: inherit;
  border: 0px;
  margin-left: 20px;
  font-size: 18px;
`