import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import MapComponent from "../components/MapComponent";
import WeatherComponent from "../components/WeatherComponent";
// import { Navigate } from "react-router-dom";
import { Fragment } from "react";
import {
  BrowserRouter as Router,
  Redirect,
} from "react-router-dom";

export default function HomeContainer() {
  const [markers, setMarkers] = useState([]);
  const [pollutionData, setPollutionData] = useState({});
  const [login, setLogin] = useState(true);

  const callbackMarkers = (marks) => {
    setMarkers(marks);
  };

  const callBackLogin = (login) => {
    setLogin(login);
  };

  if (login == false) {
    return <Redirect to="/user" />;
  }

  return (
    <div>
      <Container fluid>
        <Row>
         <h1>netZero</h1>
          <Col xs={7}>
            <MapComponent
              parentCallback={callbackMarkers}
              pollution={pollutionData}
            />
          </Col>
          <Col xs={5}>
            <WeatherComponent
              markers={markers}
              parentCallbackLogin={callBackLogin}
            ></WeatherComponent>
          </Col>
        </Row>
        <Row></Row>
      </Container>

      {/* <Router>
        <Fragment>
          <Routes>
            <Route path="/login" exact component={UserCompontent} />
            <Route to="/" component={HomeContainer}></Route>
          </Routes>
        </Fragment>
      </Router> */}
    </div>
  );
}
