import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import { Container, Box } from '@moonpig/launchpad-components'

import { Navigation, setupFirebase, FirebaseContext } from './components'
import { AddEdit, Shop, Home, Previous } from './pages'


export const App = () => {
  const firebase = setupFirebase()
  const db = firebase.firestore()
  const shoppingListsCollection = db.collection('shopping-lists')
  const [appLoading, setAppLoading] = useState(true)
  const [listStarted, setListStarted] = useState(false)

  useEffect(() => {
    const checkIfListStarted = async () => {
      await shoppingListsCollection.onSnapshot(querySnapshot => {
        const doc = querySnapshot.docs[querySnapshot.size - 1]?.data()
        if (doc && !doc.completed) {
          setListStarted(true)
        }
        setAppLoading(false)
      })
    }
    checkIfListStarted()
  }, [shoppingListsCollection])

  return (
    <FirebaseContext.Provider value={{ db, shoppingListsCollection }}>
      {appLoading ? <div>Loading</div> : (
        <Router>
        <div className="App">
          <Navigation listStarted={listStarted} />
          <Box py={6}>
            <Container limitWidth>  
              <Switch>
                <Route path="/" exact>
                  <Home />
                </Route>
                <Route path="/add">
                  <AddEdit listStarted={listStarted} setListStarted={setListStarted} />
                </Route>
                <Route path="/edit">
                  <AddEdit listStarted={listStarted} setListStarted={setListStarted} />
                </Route>
                <Route path="/completed-lists">
                  <Previous />
                </Route>
                {listStarted ? (
                  <Route path="/shop">
                    <Shop setListStarted={setListStarted} />
                  </Route>
                ) : null}
              </Switch>
            </Container>
          </Box>
        </div>
      </Router>
      )}
    </FirebaseContext.Provider>
  );
}

