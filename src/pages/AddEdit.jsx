import React from 'react'

import { AddNewList } from '../components'


export const AddEdit = ({ setListStarted, listStarted }) => {
  return (
    <div>
      <AddNewList setListStarted={setListStarted} listStarted={listStarted} />
    </div>
  )
}
