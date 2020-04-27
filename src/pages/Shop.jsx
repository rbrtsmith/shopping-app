import React, { useState, useEffect, useContext, useRef } from 'react'
import { useHistory } from 'react-router-dom';
import { styled } from '@moonpig/launchpad-utils'
import { system as s } from '@moonpig/launchpad-system'
import { IconBasket, IconCross, IconReset, IconAdd } from '@moonpig/launchpad-assets'
import { IconButton, FilledButton } from '@moonpig/launchpad-components'
import { TextInput } from '@moonpig/launchpad-forms'

import { StyledListItem, StyledListItemSelectButton } from '../components'
import { FirebaseContext } from '../components'
import { IconPencil } from '../assets'

const StyledList = styled.ul`
  ${s({ mb: 6 })}
`

const StyledItemText = styled.div`
  ${s({
    px: 6,
    height: '48px',
    lineHeight: '48px',
  })}
`

const StyledItemContent = styled.div`
  button {
    display: inline-flex;

    &:nth-child(2),
    &:nth-child(3) {
      ${({ theme }) => s({
        borderRight: `1px solid ${theme.colors.borderThree}`,
      })}
    }
  }
`

const StyledIconButton = styled(IconButton)`
  ${({ theme }) => s({
    width: '33.33%',
    borderTop: `1px solid ${theme.colors.borderThree}`,
  })}
`

const StyledIconPencilButton = styled(StyledIconButton)`
  svg {
    transform: translateY(-2px) scale(0.9);
  }
`

const StyledNotesButton = styled(IconButton)`
  position: absolute;
  top: 44px;
  right: 16px;
`

const StyledNotesForm = styled.div`
  position: relative;
  ${({ theme }) => s({
    borderTop: `1px solid ${theme.colors.borderThree}`,
    p: 6,
  })}
  
  input {
    padding-right: 50px;
  }
`

const StyledNotes = styled.ul`
  ${({ theme }) => s({
    borderTop: `1px solid ${theme.colors.borderThree}`,
    py: 4,
    pr: 4,
    pl: 6,
    mb: -4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  })}

  > li {
    ${({ theme }) => s({
      position: 'relative',
      border: `1px solid ${theme.colors.borderThree}`,
      p: 4,
      pl: 6,
      mb: 4,
      borderRadius: 2,
      bgcolor: 'infoBg',
    })}
    border-top-left-radius: 0;

    &::before {
      position: absolute;
      top: -1px;
      left: -14px;
      border-left: 13px solid transparent;
      border-right: 13px solid transparent;
      border-top: 13px solid ${({ theme }) => theme.colors.borderThree};
      content: '';
    }

    &::after {
      position: absolute;
      top: 0px;
      left: -12px;
      border-left: 12px solid transparent;
      border-right: 12px solid transparent;
      border-top: 12px solid ${({ theme }) => theme.colors.infoBg};
      content: '';
    }
  }
`

const NotesForm = ({ text, setText, handleNoteAdd, cancelEdit }) => {
  // const inputEl = useRef(null)
  const [hasChanged, setHasChanged] = useState(false)
  // useEffect(() => {
  //   inputEl.current.focus()
  // }, [])
  return (
    <StyledNotesForm>
          <TextInput
            // ref={inputEl}
            type="text"
            name="item"
            label="Add Note…"
            value={text}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && text) handleNoteAdd()
            }}
            onChange={e => {
              setText(e.target.value)
              setHasChanged(true)
            }}
          />
          {text && hasChanged && <StyledNotesButton icon={IconAdd} type="button" onClick={handleNoteAdd}>Submit</StyledNotesButton>}
    </StyledNotesForm>
  )
}

export const Shop = ({ setListStarted }) => {
  const history = useHistory()
  const [currentDocument, setCurentDocument] = useState({})
  const [documentId, setDocumentId] = useState('')
  const [activeItemIndex, setActiveItemIndex] = useState(-1)
  const [activeItemNoteIndex, setActiveItemNoteIndex] = useState(-1)
  const [noteText, setNoteText] = useState('')
  const { shoppingListsCollection } = useContext(FirebaseContext)
  const getInProgressCollection = async () => {
    await shoppingListsCollection.onSnapshot(querySnapshot => {
      const doc = querySnapshot.docs[querySnapshot.size - 1]?.data()
      if (doc && !doc.completed) {
        setCurentDocument(doc)
        return setDocumentId(querySnapshot.docs[querySnapshot.size - 1].id)
      }
    })
  }

  useEffect(() => {
    getInProgressCollection()
    // eslint-disable-next-line
  }, [shoppingListsCollection])

  const handleItemComplete = (index, isComplete) => {
    const items = currentDocument.items || []

    shoppingListsCollection.doc(documentId).set({
      completed: false,
      items: [
        ...items.slice(0, index),
        {
          ...items[index],
          completed: isComplete,
          },
        ...items.slice(index + 1)
      ]
    }).then(() => {
      setActiveItemIndex(-1)
      setActiveItemNoteIndex(-1)
      getInProgressCollection()
      setNoteText('')
    }).catch(error => console.error(`Error ${isComplete ? 'completing' : 'undoing'}  item: `, error))
  }

  const handleNoteAdd = (index) => {
    const items = currentDocument.items || []

    shoppingListsCollection.doc(documentId).set({
      completed: false,
      items: [
        ...items.slice(0, index),
        {
          ...items[index],
          notes: [...items[index].notes, noteText],
          },
        ...items.slice(index + 1)
      ]
    }).then(() => {
      setActiveItemIndex(-1)
      setActiveItemNoteIndex(-1)
      getInProgressCollection()
      setNoteText('')
    }).catch(error => console.error('Error adding note item: ', error))
  }

  const completeShoppingList = () => {
    const items = currentDocument.items || []
    shoppingListsCollection.doc(documentId).set({
      completed: true,
      items
    }).then(() => {
      setActiveItemIndex(-1)
      setActiveItemNoteIndex(-1)
      setListStarted(false)
      history.push('/')
    }).catch(error => console.error('Error completing list', error))
  }

  const allCompleted = currentDocument.items?.every(item => item.completed)

  return (<div>
    <h2>Shop</h2>
    <StyledList>
      {currentDocument.items?.map((item, index) => (
        <StyledListItem isActive={activeItemIndex === index} key={item.title}>
          {activeItemIndex === index ? (
            <StyledItemContent>
              <StyledItemText>
                {item.completed ? <span style={{ color: 'green'}}>✔</span> : ''} {item.title}
              </StyledItemText>
              <StyledIconButton icon={IconCross} onClick={() => {
                setActiveItemIndex(-1)
                setActiveItemNoteIndex(-1)
                setNoteText('')
              }}>Cancel</StyledIconButton>
              {item.completed ? (
                <StyledIconButton icon={IconReset} onClick={() => handleItemComplete(index, false)}>Undo</StyledIconButton>
              ) : (
                <StyledIconButton icon={IconBasket} onClick={() => handleItemComplete(index, true)}>Complete</StyledIconButton>
              )}
              <StyledIconPencilButton icon={IconPencil} onClick={() => setActiveItemNoteIndex(index)}>Add Note</StyledIconPencilButton>
              {item.notes.length ? (
                <>
                  <StyledNotes>
                    {item.notes.map(note => (
                      <li key={note}>
                        {note}
                      </li>
                    ))}
                  </StyledNotes>
                </>
              ) : null}
              {activeItemNoteIndex === index ? (
                <NotesForm text={noteText} setText={setNoteText} handleNoteAdd={() => handleNoteAdd(index)} cancelEdit={() => setActiveItemNoteIndex(-1)} />
              ) : null}
            </StyledItemContent>
          ) : (
            <>
            <StyledListItemSelectButton onClick={() => setActiveItemIndex(index)}>
              {item.completed ? <span style={{ color: 'green'}}>✔</span> : ''} {item.title}
            </StyledListItemSelectButton>
            {item.notes.length ? (
              <>
                <StyledNotes>
                  {item.notes.map(note => (
                    <li key={note}>
                      {note}
                    </li>
                  ))}
                </StyledNotes>
              </>
            ) : null}
            </>
          )}
        </StyledListItem>
      ))}
    </StyledList>
    {allCompleted ? <FilledButton onClick={completeShoppingList}>Complete Shopping List</FilledButton> : null}
  </div>)
}
