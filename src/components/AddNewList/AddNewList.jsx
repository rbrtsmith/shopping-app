import React, { useState, useEffect, useContext } from 'react'
import { TextInput } from '@moonpig/launchpad-forms'
import { styled } from '@moonpig/launchpad-utils'
import { system as s } from '@moonpig/launchpad-system'
import { Box, IconButton, OutlinedButton } from '@moonpig/launchpad-components'
import { IconAdd, IconCross, IconCheckedCircle, IconTrashCan } from '@moonpig/launchpad-assets'

import { StyledListItem, StyledListItemSelectButton } from '../'
import { IconPencil } from '../../assets'
import { FirebaseContext } from '../'

const StyledAddForm = styled.div`
  position: relative;

  > button {
    position: absolute;
    bottom: 0;
    right: 0;
  }

  input {
    padding-right: 50px;
  }
`

const StyledEditingForm = styled.div`
  position: relative;
  label {
    display: none;
  }
  button {
    display: inline-flex;
    width: 50%;
    &:nth-child(2) {
      ${({ theme }) => s({
        borderRight: `2px solid ${theme.colors.borderThree}`,
      })}
    }
  }

  input {
    padding-right: 50px;
  }

  .edit-button {
    position: absolute;
    top: 0;
    right: 0;
    width: 60px;
  }
`

const AddForm = ({ text, setText, handleItemAdd, disabled }) => (
  <StyledAddForm>
    <Box mb={4}>
      <TextInput
        label="Add new item"
        name="add-item"
        value={text}
        disabled={disabled}
        placeholder="Steak…"
        onKeyPress={(e) => {
          if (e.key === 'Enter' && text) handleItemAdd()
        }}
        onChange={e => setText(e.target.value)}
      />
    </Box>
    {text && <IconButton icon={IconAdd} onClick={handleItemAdd} />}
  </StyledAddForm>
)

const EditingForm = ({ text, setText, handleItemEdit, handleItemDelete, cancelEdit }) => {
  const [hasChanged, setHasChanged] = useState(false)
  return (
    <StyledEditingForm>
      <TextInput
        label="Edit item"
        type="text"
        name="item"
        value={text}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && text) handleItemEdit()
        }}
        onChange={e => {
          setText(e.target.value)
          setHasChanged(true)
        }}
      />
      <IconButton icon={IconCross} onClick={cancelEdit} title="cancel" />
      {<IconButton icon={IconTrashCan} title="delete" onClick={handleItemDelete} />}
      {text && hasChanged && <IconButton className="edit-button" icon={IconCheckedCircle} title="edit" onClick={handleItemEdit} />}
    </StyledEditingForm>
  )
}

export const AddNewList = ({ setListStarted, listStarted }) => {
  const { shoppingListsCollection } = useContext(FirebaseContext)
  const [documentId, setDocumentId] = useState('')
  const [currentDocument, setCurentDocument] = useState({})
  const [text, setText] = useState('')
  const [editingIndex, setEditingIndex] = useState(-1)
  const [editingText, setEditingText] = useState('')

  const getInProgressCollection = async () => {
    await shoppingListsCollection.onSnapshot(querySnapshot => {
      const doc = querySnapshot.docs[querySnapshot.size - 1]?.data()
      if (doc && !doc.completed) {
        setCurentDocument(doc)
        return setDocumentId(querySnapshot.docs[querySnapshot.size - 1].id)
      }

       // eslint-disable-next-line
      const today = `${new Date(Date.now()).toLocaleString().replace(/[\/\s:,]/g, '_')}`
      setCurentDocument({})
      return setDocumentId(`List-${today}`)
    })
  }

  useEffect(() => {
    getInProgressCollection()
    // eslint-disable-next-line
  }, [listStarted])

  const handleItemAdd = () => {
    const items = currentDocument.items || []
    shoppingListsCollection.doc(documentId).set({
      completed: false,
      items: [...items, { id: `${Math.random()}`, completed: false, title: text, notes: [] }]
    }).then(() => {
      setListStarted(true)
      getInProgressCollection()
      setText('')
    }).catch(error => console.error('Error writing document: ', error))
  }

  const handleItemEdit = (index) => {
    const items = currentDocument.items || []
    shoppingListsCollection.doc(documentId).set({
      completed: false,
      items: [
        ...items.slice(0, index),
        {
          ...items[index],
          title: editingText,
          completed: false,
          },
        ...items.slice(index + 1)
      ]
    }).then(() => {
      setEditingIndex(-1)
      setEditingText('')
      getInProgressCollection()
    }).catch(error => console.error('Error editing item: ', error))
  }

  const handleItemDelete = (index) => {
    const items = currentDocument.items || []
    shoppingListsCollection.doc(documentId).set({
      completed: false,
      items: [
        ...items.slice(0, index),
        ...items.slice(index + 1)
      ]
    }).then(() => {
      setEditingIndex(-1)
      setEditingText('')
      getInProgressCollection()
    }).catch(error => console.error('Error deleting item: ', error))
  }

  const handleReset = () => {
    shoppingListsCollection.doc(documentId).delete()
      .then(() => {
        setListStarted(false)
        getInProgressCollection()
      })
      .catch(error => console.error('Error deleting shopping list: ', error))
  }

  return (
    <div>
    <h2>{listStarted ? 'Current' : 'New'} Shopping List</h2>
    <Box mb={6}>
      {currentDocument.items?.length ? (
        <ul>
          {currentDocument.items.map((item, index) => (
          <StyledListItem isActive={editingIndex === index}
            key={item.title}
          >
            {editingIndex === index ? (
              <EditingForm
                text={editingText}
                setText={setEditingText}
                handleItemEdit={() => handleItemEdit(index)}
                handleItemDelete={() => handleItemDelete(index)}
                cancelEdit={() => {
                  setEditingIndex(-1)
                  setEditingText('')
                }}
              />
            ) : (
              <StyledListItemSelectButton onClick={() => {
                if (text !== '') return
                setEditingText(item.title)
                return setEditingIndex(index)
              }}>
                {item.title}
                <IconPencil width="22px" height="22px" aria-hidden />
              </StyledListItemSelectButton>
            )}
          </StyledListItem>
        ))}
        </ul>
      ) : <Box typography="bodyBold">There are currently no items in your shopping list.</Box>}
    </Box>
    <Box mb={6}>
      <AddForm disabled={editingIndex !== -1} text={text} setText={setText} handleItemAdd={handleItemAdd} />
    </Box>
    {currentDocument.items?.length ? <OutlinedButton onClick={handleReset}>Reset List</OutlinedButton> : null}
  </div>
  )
}
