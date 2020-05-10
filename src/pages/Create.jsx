import React, { useState, useContext } from 'react'
import { useHistory } from 'react-router-dom';
import { TextInput } from '@moonpig/launchpad-forms'
import { styled } from '@moonpig/launchpad-utils'
import { Box, IconButton } from '@moonpig/launchpad-components'
import { IconAdd } from '@moonpig/launchpad-assets'

import { FirebaseContext } from '../components'

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
const CreateListForm = ({ text, setText, createList }) => (
  <StyledAddForm>
    <Box mb={4} pt={4}>
      <TextInput
        label="Add vendor"
        name="add-vendor"
        value={text}
        placeholder="E.g. Morrisions…"
        onKeyPress={(e) => {
          if (e.key === 'Enter' && text) createList()
        }}
        onChange={e => setText(e.target.value)}
      />
    </Box>
    {text && <IconButton icon={IconAdd} onClick={createList} />}
  </StyledAddForm>
)

const createDocumentId = () => {
  const [day, month, yearTime] = new Date(Date.now()).toLocaleString().split('/')
  const [year, time] = yearTime.split(',')
  return `${year}_${month}_${day}__${time.trim()}`
}

export const Create = () => {
  const history = useHistory()
  const { firebase, shoppingListsCollection } = useContext(FirebaseContext)
  const [titleText, setTitleText] = useState('')
  const CreateList = () => {
    const id = createDocumentId()
    shoppingListsCollection.doc(id).set({
      completed: false,
      items: [],
      title: titleText,
      createdAt: firebase.firestore.Timestamp.fromDate(new Date())
    }).then(() => {
      setTitleText('')
      history.push(`/edit/${id}`)
    }).catch(error => console.error('Error writing document title: ', error))
  }

  return (
    <div>
    <h2>Create New Shopping List</h2>
    <Box>
      <CreateListForm text={titleText} setText={v => setTitleText(v)} createList={CreateList} />
    </Box>
  </div>
  )
}
