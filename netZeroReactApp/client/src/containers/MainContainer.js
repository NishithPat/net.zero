import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import HomeContainer from "./HomeContainer";
import UserCompontent from "../components/UserComponent";

export default function MainContainer() {
  return (
    <Router>
      <div>
        <Switch>
          <Route exact path="/user" component={UserCompontent} />
          <Route exact path="/" component={HomeContainer} />
        </Switch>
      </div>
    </Router>
  );
}
