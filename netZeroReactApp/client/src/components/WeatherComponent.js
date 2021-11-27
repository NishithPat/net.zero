import React, { useState } from "react";
import DatePicker from "react-date-picker";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  Label,
  CartesianGrid,
} from "recharts";
import Geocode from "react-geocode";
import Button from "react-bootstrap/Button";
import { Container, Row, Col } from "react-bootstrap";

// import * as d3 from 'd3';

function WeatherComponent({ markers, parentCallbackLogin }) {
  var date = Date();

  const api = {
    key: "54b108763f27c2e29ad2eec3d2d9dcc3",
    base: "http://api.openweathermap.org/data/2.5/",
  };
  const [location, setLocation] = React.useState("Please pin a location");
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState({});
  const [pollution, setPollution] = useState({});
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [login, setLogin] = useState(false);
  const startDateTimestamp = (startDate / 1000) | 0;
  const endDateTimestamp = (endDate / 1000) | 0;

  function displayLocation(latitude, longitude) {
    Geocode.setApiKey("AIzaSyCouekgXHz8Yzs4OS2wsGNWBT6lzF3YXu0");
    Geocode.fromLatLng(latitude, longitude).then((response) => {
      const checkCity = response.results[0];
      if (typeof checkCity.address_components[1] === "undefined") {
        window.alert("Location is not valid for search");
      } else {
        const city = response.results[0].address_components[1].long_name;
        getWeather(city);
        setLocation(city);
      }
    });
  }

  function getWeather(query) {
    console.log(query);
    fetch(`${api.base}weather?q=${query}&units=metric&APPID=${api.key}`)
      .then((res) => res.json())
      .then((result) => {
        setWeather(result);
        console.log(weather);
        // setQuery("");
      });
  }

  const sendLoginData = () => {
    parentCallbackLogin(login);
  };

  const getDateRangePollution = async () => {
    if (startDateTimestamp >= endDateTimestamp) {
      window.alert("Please select a valid time");
    } else {
      try {
        fetch(
          `${api.base}air_pollution/history?lat=${
            markers[markers.length - 1].lat
          }&lon=${
            markers[markers.length - 1].lng
          }&start=${startDateTimestamp}&end=${endDateTimestamp}&APPID=${
            api.key
          }`
        )
          .then((res) => res.json())
          .then((resultRange) => {
            setPollution(resultRange);
          });
        displayLocation(
          markers[markers.length - 1].lat,
          markers[markers.length - 1].lng
        );
      } catch {
        window.alert("Please pin a location");
      }
    }
  };

  // const formatXAxis = (date).forEach (date => {
  //   return moment(date).format('DD/MM/YY HH:mm')})

  return (
    <Container fluid>
      <Button variant="secondary" onClick={sendLoginData} id="login">
        Login
      </Button>

      <Row>
        <div
          className={
            typeof weather.main != "undefined"
              ? weather.main.temp > 16
                ? "app warm"
                : "app"
              : "app"
          }
        >
          <main className="weather-box">
            <div className="city-info">
              <Row>
                <Col>
                  <h3 onChange={displayLocation}> {location} </h3>
                </Col>
              </Row>
              <Row>
                <Col>
                  {typeof weather.main != "undefined" ? (
                    <div>
                      <div className="location-box">
                        {weather.name}, {weather.sys.country}
                      </div>
                      <div className="weather-box">
                        <div className="temp">
                          {Math.round(weather.main.temp)}°c
                        </div>
                        <div className="weather">{weather.weather[0].main}</div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                </Col>
              </Row>

              <Row>
                <Col>
                  <div className="date-time-picker-start">
                    Start Date
                    <DatePicker
                      onChange={setStartDate}
                      value={startDate}
                      name={"Start Date"}
                      calendarType={"ISO 8601"}
                    />
                  </div>
                </Col>

                <Col>
                  <div className="date-time-picker-end">
                    End Date
                    <DatePicker
                      onChange={setEndDate}
                      value={endDate}
                      name={"End Date"}
                    />
                  </div>
                </Col>
              </Row>

              <Row>
                <Col>
                  <div className="pollution-data">
                    <Button variant="light" onClick={getDateRangePollution}>
                      Get pollution in date range
                    </Button>
                  </div>
                </Col>
              </Row>
              <br></br>
            </div>

            <div className="charts">
              <Row>
                <LineChart
                  id="chart1"
                  width={600}
                  height={300}
                  data={pollution.list}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <Line
                    type="monotone"
                    dataKey="components.nh3"
                    stroke="#b284d8"
                  />

                  <Line
                    type="monotone"
                    dataKey="components.no"
                    stroke="#84d888"
                  />

                  <Line
                    type="monotone"
                    dataKey="components.pm10"
                    stroke="#d4d884"
                  />

                  <Line
                    type="monotone"
                    dataKey="components.pm2_5"
                    stroke="#d88884"
                  />

                  <Line
                    type="monotone"
                    dataKey="components.o3"
                    stroke="#c4c1c1"
                  />

                  <CartesianGrid stroke="#ccc" />

                  <XAxis
                    dataKey="dt"
                    domain={["dataMin", "dataMax"]}
                    type="number"
                  >
                    <Label
                      value="Pollution"
                      offset={-3}
                      position="insideBottom"
                      fill="#c4c1c1"
                    />
                  </XAxis>

                  <Tooltip />
                </LineChart>
              </Row>

              <Row>
                <LineChart
                  id="chart2"
                  width={300}
                  height={300}
                  data={pollution.list}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <Line type="monotone" dataKey="main.aqi" stroke="#8884d8" />
                  <CartesianGrid stroke="#ccc" />
                  <XAxis
                    dataKey="dt"
                    domain={["dataMin", "dataMax"]}
                    type="number"
                  >
                    <Label
                      value="Air Quality"
                      offset={-3}
                      position="insideBottom"
                      fill="#c4c1c1"
                    />
                  </XAxis>
                  <Tooltip />
                </LineChart>

                <LineChart
                  id="chart3"
                  width={300}
                  height={300}
                  data={pollution.list}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <Line
                    type="monotone"
                    dataKey="components.co"
                    stroke="#8884d8"
                  />
                  <CartesianGrid stroke="#ccc" />
                  <XAxis
                    dataKey="dt"
                    domain={["dataMin", "dataMax"]}
                    type="number"
                  >
                    <Label
                      value="CO"
                      offset={-3}
                      position="insideBottom"
                      fill="#c4c1c1"
                    />
                  </XAxis>
                  <Tooltip />
                </LineChart>
              </Row>
            </div>
          </main>
        </div>
      </Row>
    </Container>
  );
}
export default WeatherComponent;
