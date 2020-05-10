import React, { useEffect, useContext, useState } from 'react'
import { Link, useParams, useHistory } from "react-router-dom";
import { TextInput } from '@moonpig/launchpad-forms'
import { styled } from '@moonpig/launchpad-utils'
import { system as s } from '@moonpig/launchpad-system'
import { Box, Heading, IconButton, OutlinedButton, FilledButton } from '@moonpig/launchpad-components'
import { IconAdd, IconCross, IconCheckedCircle, IconTrashCan } from '@moonpig/launchpad-assets'

import { IconPencil } from '../assets'
import { FirebaseContext, StyledListItem, StyledListItemSelectButton } from '../components'
import { formatDateFromTimestamp } from '../utils'

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

const StyledListLink = styled(Link)`
  display: flex;
  align-items: center;
  padding-left: 16px;
  padding-right: 16px;
  height: 48px;
  color: inherit;
  &:hover,
  &:focus {
    text-decoration: none;
  }
`

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

const AddForm = ({ text, setText, handleItemAdd, disabled }) => (
  <StyledAddForm>
    <Box mb={4}>
      <TextInput
        label="Add new item"
        name="add-item"
        value={text}
        disabled={disabled}
        placeholder="E.g. Steak…"
        onKeyPress={(e) => {
          if (e.key === 'Enter' && text) handleItemAdd()
        }}
        onChange={e => setText(e.target.value)}
      />
    </Box>
    {text && <IconButton icon={IconAdd} onClick={handleItemAdd} />}
  </StyledAddForm>
)



export const Edit = () => {
  const history = useHistory()
  const [isLoading, setIsLoading] = useState(true)
  const [lists, setLists] = useState([])
  const [currentDocument, setCurentDocument] = useState(null)
  const [editingIndex, setEditingIndex] = useState(-1)
  const [editingText, setEditingText] = useState('')
  const [addingText, setAddingText] = useState('')
  const [isDeletePromptVisibile, setIsDeletePromptVisibile] = useState(false)

  const { id: documentId } = useParams()
  const { shoppingListsCollection } = useContext(FirebaseContext)

  const getCurrentDocument = async () => {
    await shoppingListsCollection.doc(documentId).onSnapshot(doc => {
      setCurentDocument(doc.data())
    })
  }

  const handleItemAdd = () => {
    const items = currentDocument.items || []
    shoppingListsCollection.doc(documentId).set({
      ...currentDocument,
      items: [...items, { id: `${Math.random()}`, completed: false, title: addingText, notes: [] }]
    }).then(() => {
      getCurrentDocument()
      setAddingText('')
    }).catch(error => console.error('Error writing document item: ', error))
  }

  const handleItemEdit = (index) => {
    const items = currentDocument.items || []
    shoppingListsCollection.doc(documentId).set({
      ...currentDocument,
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
      getCurrentDocument()
    }).catch(error => console.error('Error editing item: ', error))
  }

  const handleItemDelete = (index) => {
    const items = currentDocument.items || []
    shoppingListsCollection.doc(documentId).set({
      ...currentDocument,
      items: [
        ...items.slice(0, index),
        ...items.slice(index + 1)
      ]
    }).then(() => {
      setEditingIndex(-1)
      setEditingText('')
      getCurrentDocument()
    }).catch(error => console.error('Error deleting item: ', error))
  }

  const handleListDelete = () => {
    setIsLoading(true)
    shoppingListsCollection.doc(documentId).delete()
      .then(() => {
          history.push('/edit/')
      })
      .catch(error => console.error('Error deleting shopping list: ', error))
  }

  useEffect(() => {
    const getLists = async () => {
      setIsLoading(true)
      const doc = await shoppingListsCollection.where('completed', '==', false).get()
      if (doc?.docs?.length) {
        setLists(doc.docs.map(d => ({
          id: d.id,
          ...d.data()
        })))
      }
      setIsLoading(false)
    }

    const getMatchingList = async () => {
      setIsLoading(true)
      await shoppingListsCollection.doc(documentId).onSnapshot(doc => {
        const data = doc.data()
        setIsLoading(false)
        if (data.completed) {
          return
        }
        setCurentDocument(data)
      })
    }

    if (documentId) {
      setLists([])
      getMatchingList()
    } else {
      setCurentDocument(null)
      getLists()
    }

  }, [shoppingListsCollection, documentId])
  
  return (
    <div>
      {isLoading ? 'Loading…' : (
        lists?.length ? (
          <>
            <h2>Shopping Lists (Edit)</h2>
            <ul>
              {lists?.map(item => (
                <StyledListItem key={item.id}>
                  <StyledListLink to={`/edit/${item.id}`}>
                    {item.title}: {formatDateFromTimestamp(item.createdAt)}
                  </StyledListLink>
                </StyledListItem>
              ))}
            </ul>
          </>
        ) : (
          <Box>
            {currentDocument ? (
              <div>
                <Box mb={6}>
                  <Heading mb={0} level="h2">{currentDocument.title} Shopping list</Heading>
                  Created on {formatDateFromTimestamp(currentDocument.createdAt)}
                </Box>
                <ul>
                  {currentDocument?.items?.map((item, index) => (
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
                <AddForm disabled={editingIndex !== -1} text={addingText} setText={setAddingText} handleItemAdd={handleItemAdd} />
                <Box pt={4}>
                  {isDeletePromptVisibile ? (
                    <>
                      <Box mb={4}>Are you sure you want to delete this list?</Box>
                      <OutlinedButton mr={6} onClick={() => setIsDeletePromptVisibile(false)}>No</OutlinedButton>
                      <FilledButton onClick={handleListDelete}>Yes</FilledButton>
                    </>
                  ) : <OutlinedButton onClick={() => setIsDeletePromptVisibile(true)}>Delete List</OutlinedButton>}
                </Box>
              </div>
            ) : (
            <div>
              {documentId ? 'List not found' : 'No Lists found'}
            </div>
            )}
          </Box>
        )
      )}
    </div>
  )
}
