import React, { useState, useContext, useEffect } from 'react'

import { FirebaseContext } from '../components'

const formatListItemId = id =>
  id.replace(/List-/g, '').split('__').map((item, index) =>
    index === 0 ? item.replace(/_/g, '/') : item.replace(/_/g, ':')).join(', ')

export const Previous = () => {
  const [completedLists, setCompletedLists] = useState([])
  const [openListId, setOpenListId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { shoppingListsCollection } = useContext(FirebaseContext)

  useEffect(() => {
    const getCompletedCollections = async () => {
      const doc = await shoppingListsCollection.get()
      if (doc?.docs?.length) {
        setCompletedLists(doc.docs.filter(d => d.data()?.completed).reverse().map(d => ({
          id: d.id,
          ...d.data()
        })))
      }
      setIsLoading(false)
    }
    getCompletedCollections()
  }, [shoppingListsCollection])

  return (
    <div>
      <h2>Completed Shopping lists</h2>
      {isLoading ? (<div>Loading…</div>) : (
        <div>
          {completedLists.length ? (
            <ul>
              {completedLists.map(list =>
                <li key={list.id}>
                  <button onClick={() => {
                    openListId === list.id ? setOpenListId('') : setOpenListId(list.id)
                  }}>{formatListItemId(list.id)}</button>
                  {openListId === list.id ? (
                    <ul>
                      {list.items.map(item => (
                        <li key={item.title}>
                          {item.title}
                          {item.notes.length ? (
                            <ul>
                              {item.notes.map(note => <li key={note}>{note}</li>)}
                            </ul>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              )}
            </ul>
          ): <div>No completed shopping lists</div>}
        </div>
      )}
    </div>
  )
}