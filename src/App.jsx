import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import { Container, Box } from '@moonpig/launchpad-components'

import { Navigation, setupFirebase, FirebaseContext } from './components'
import { Edit, Create, Shop, Home, Previous } from './pages'


export const App = () => {
  const firebase = setupFirebase()
  const db = firebase.firestore()
  const shoppingListsCollection = db.collection('shopping-lists')

  return (
    <FirebaseContext.Provider value={{ firebase, db, shoppingListsCollection }}>
        <Router>
        <div className="App">
          <Navigation />
          <Box py={6}>
            <Container limitWidth>  
              <Switch>
                <Route path="/" exact>
                  <Home />
                </Route>
                <Route path="/create">
                  <Create />
                </Route>
                <Route path="/edit/:id?">
                  <Edit />
                </Route>
                <Route path="/completed-lists">
                  <Previous />
                </Route>
                <Route path="/shop/:id?">
                  <Shop />
                </Route>
              </Switch>
            </Container>
          </Box>
        </div>
        </Router>
    </FirebaseContext.Provider>
  );
}

