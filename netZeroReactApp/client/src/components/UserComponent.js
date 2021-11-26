import React, { useState } from "react";
import Web3 from "web3";
import uuid from "react-uuid";
import PollutionDataContract from "./../contracts/PollutionDataContract.json";

import AQIPlot from "./plots/AQIPlot";
import NO2Plot from "./plots/NO2Plot";
import O3Plot from "./plots/O3Plot";
import PM10Plot from "./plots/PM10Plot";
import PM2_5Plot from "./plots/PM2_5Plot";
import { Container, Row, Col, Button } from "react-bootstrap";

import "./CSS/UserComponent.css";

function UserComponent() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");

  const [pollutionDataArray, setPollutionDataArray] = useState(undefined);
  const [dataArray, setDataArray] = useState(undefined);

  const [locationData, setLocationData] = useState(undefined);
  const [showlocationData, setShowLocationData] = useState(false);

  const connectToWallet = async () => {
    try {
      console.log("connected!");

      const web3Instance = await getWeb3Obj();
      console.log(web3Instance);

      const accountsInstance = await web3Instance.eth.getAccounts();

      const networkId = await web3Instance.eth.net.getId();
      const deployedNetwork = PollutionDataContract.networks[networkId];

      console.log("contract address on the network", deployedNetwork.address);

      const instance = new web3Instance.eth.Contract(
        PollutionDataContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      setWeb3(web3Instance);
      setAccounts(accountsInstance);
      setContract(instance);
      setConnected(true);

      setEventListener(instance, accountsInstance);

      await listenMMAccount(web3Instance);
    } catch (error) {
      console.log(error);
    }
  };

  const getWeb3Obj = async () => {
    // Modern dapp browsers...
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        // Request account access if needed
        await window.ethereum.enable();
        // Accounts now exposed
        return web3;
      } catch (error) {
        return error;
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      // Use Mist/MetaMask's provider.
      const web3 = window.web3;
      console.log("Injected web3 detected.");
      return web3;
    }
    // Fallback to localhost; use dev console port by default...
    else {
      const provider = new Web3.providers.HttpProvider("http://127.0.0.1:8545");
      const web3 = new Web3(provider);
      console.log("No web3 instance injected, using Local web3.");
      return web3;
    }
  };

  const listenMMAccount = async (web3Obj) => {
    window.ethereum.on("accountsChanged", async () => {
      const accountsInstance = await web3Obj.eth.getAccounts();
      console.log(accountsInstance);
      setAccounts(accountsInstance);

      if (accountsInstance.length === 0) {
        setConnected(false);
      }

      setPollutionDataArray(undefined);
    });
  };

  const setEventListener = (contractInstance, _accounts) => {
    console.log(contractInstance._address, "from event listener");
    contractInstance.events
      .RequestMultipleFulfilled({ filter: { requester_: _accounts[0] } })
      .on("data", function (event) {
        let data = event.returnValues;

        console.log(data);
        alert(`the aqi value of the requested location is ${data.aqi_}`);
      });
  };

  const lattitudeFunction = async (event) => {
    console.log(event.target.value);
    setLat(event.target.value);
  };

  const longitudeFunction = async (event) => {
    console.log(event.target.value);
    setLon(event.target.value);
  };

  const RequestFunction = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      await contract.methods
        .requestMultipleParametersFromUser(lat, lon, accounts[0])
        .send({ from: accounts[0] });
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
    setLon("");
    setLat("");
  };

  const RequestAndTrackFunction = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      await contract.methods
        .addLocationDataAndFetchPollutionData(lat, lon)
        .send({ from: accounts[0] });
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
    setLon("");
    setLat("");
  };

  const gettingPastEvents = () => {
    const returnCoordinateValuesFromPastEvents = [];
    contract
      .getPastEvents("coordinatesAndAddress", {
        fromBlock: 1,
        filter: { requester_: accounts[0] },
      })
      .then(function (events) {
        events.forEach((event) => {
          returnCoordinateValuesFromPastEvents.push({
            lat: event.returnValues.lat_,
            lon: event.returnValues.lon_,
            timestamp: new Date(event.returnValues.timestamp_ * 1000),
          });
        });
        console.log(returnCoordinateValuesFromPastEvents);

        let returnPollutionValuesFromPastEvents = [];
        contract
          .getPastEvents("RequestMultipleFulfilled", {
            fromBlock: 1,
            filter: { requester_: accounts[0] },
          })
          .then(function (events) {
            events.forEach((event) => {
              returnPollutionValuesFromPastEvents.push({
                aqi: event.returnValues.aqi_,
                no2: event.returnValues.no2_ / 10 ** 8,
                o3: event.returnValues.o3_ / 10 ** 8,
                pm10: event.returnValues.pm10_ / 10 ** 8,
                pm2_5: event.returnValues.pm2_5_ / 10 ** 8,
              });
            });
            console.log(returnPollutionValuesFromPastEvents);

            for (
              let i = 0;
              i < returnCoordinateValuesFromPastEvents.length;
              i++
            ) {
              returnCoordinateValuesFromPastEvents[i].aqi =
                returnPollutionValuesFromPastEvents[i].aqi;
              returnCoordinateValuesFromPastEvents[i].no2 =
                returnPollutionValuesFromPastEvents[i].no2;
              returnCoordinateValuesFromPastEvents[i].o3 =
                returnPollutionValuesFromPastEvents[i].o3;
              returnCoordinateValuesFromPastEvents[i].pm10 =
                returnPollutionValuesFromPastEvents[i].pm10;
              returnCoordinateValuesFromPastEvents[i].pm2_5 =
                returnPollutionValuesFromPastEvents[i].pm2_5;
            }

            setPollutionDataArray(returnCoordinateValuesFromPastEvents);
            setDataArray(returnCoordinateValuesFromPastEvents);
          });
      });

    setShowLocationData(false);
  };

  const gettingPastDayEvents = async () => {
    const latestBlock = await web3.eth.getBlockNumber();
    console.log(latestBlock);
    setPollutionDataArray(undefined);

    const returnCoordinateValuesFromPastEvents = [];
    contract
      .getPastEvents("coordinatesAndAddress", {
        fromBlock: latestBlock - 6000,
        toBlock: latestBlock,
        filter: { requester_: accounts[0] },
      })
      .then(function (events) {
        events.forEach((event) => {
          returnCoordinateValuesFromPastEvents.push({
            lat: event.returnValues.lat_,
            lon: event.returnValues.lon_,
            timestamp: new Date(event.returnValues.timestamp_ * 1000),
          });
        });
        console.log(returnCoordinateValuesFromPastEvents);

        let returnPollutionValuesFromPastEvents = [];
        contract
          .getPastEvents("RequestMultipleFulfilled", {
            fromBlock: latestBlock - 6000,
            toBlock: latestBlock,
            filter: { requester_: accounts[0] },
          })
          .then(function (events) {
            events.forEach((event) => {
              returnPollutionValuesFromPastEvents.push({
                aqi: event.returnValues.aqi_,
                no2: event.returnValues.no2_ / 10 ** 8,
                o3: event.returnValues.o3_ / 10 ** 8,
                pm10: event.returnValues.pm10_ / 10 ** 8,
                pm2_5: event.returnValues.pm2_5_ / 10 ** 8,
              });
            });
            console.log(returnPollutionValuesFromPastEvents);

            for (
              let i = 0;
              i < returnCoordinateValuesFromPastEvents.length;
              i++
            ) {
              returnCoordinateValuesFromPastEvents[i].aqi =
                returnPollutionValuesFromPastEvents[i].aqi;
              returnCoordinateValuesFromPastEvents[i].no2 =
                returnPollutionValuesFromPastEvents[i].no2;
              returnCoordinateValuesFromPastEvents[i].o3 =
                returnPollutionValuesFromPastEvents[i].o3;
              returnCoordinateValuesFromPastEvents[i].pm10 =
                returnPollutionValuesFromPastEvents[i].pm10;
              returnCoordinateValuesFromPastEvents[i].pm2_5 =
                returnPollutionValuesFromPastEvents[i].pm2_5;
            }

            setPollutionDataArray(returnCoordinateValuesFromPastEvents);
          });
      });
    setShowLocationData(false);
  };

  const gettingDataOfALocation = async () => {
    const locationArray = dataArray.filter(
      (ele) => ele.lat === lat && ele.lon === lon
    );
    setLocationData(locationArray);
    setPollutionDataArray(locationArray);
    setShowLocationData(true);
  };

  return (
    <Container fluid>
      <div className="App">
        {!connected && (
          <Button id="login" onClick={connectToWallet}>
            Connect
          </Button>
        )}
        <Row>
          <Col>
            {connected && (
              <div className="input-box">
                <label htmlFor="lattitude">Lattitude</label>
                <input
                  id="lattitude"
                  value={lat}
                  onChange={lattitudeFunction}
                />
                <br></br>
                <label htmlFor="longitude">Longitude</label>
                <input
                  id="longitude"
                  value={lon}
                  onChange={longitudeFunction}
                />
                <form onSubmit={RequestFunction}>
                  <Button id="request-once" type="submit">
                    request once
                  </Button>
                </form>
                <form onSubmit={RequestAndTrackFunction}>
                  <Button id="request-track" type="submit">
                    request and track
                  </Button>
                </form>
              </div>
            )}
            <b>{loading && "...loading"}</b>
            <br />
          </Col>

          <Col>
            <div className="account-box">
              <div>
                {connected && (
                  <p>
                    <b>Account:</b> {accounts[0]}
                  </p>
                )}
              </div>
              <div>
                {connected && (
                  <p>
                    {" "}
                    <b>Deployed contract:</b> {contract._address}
                  </p>
                )}
              </div>
            </div>
          </Col>
        </Row>
        {connected && (
          <div>
            <Button onClick={gettingPastEvents}>Get All Past Events</Button>
            <Button onClick={gettingPastDayEvents}>
              Get Events(last 24 hours)
            </Button>
            {dataArray && (
              <Button onClick={gettingDataOfALocation}>
                Pollution data of given coordinate
              </Button>
            )}
            <div>
              {showlocationData && (
                <p>
                  green house gases are measured in micro grams per cubic meter
                  of air
                </p>
              )}
              {showlocationData && (
                <div className="DataPlots">
                  {locationData && <AQIPlot locationData={locationData} />}
                  {locationData && <NO2Plot locationData={locationData} />}
                  {locationData && <O3Plot locationData={locationData} />}
                  {locationData && <PM10Plot locationData={locationData} />}
                  {locationData && <PM2_5Plot locationData={locationData} />}
                </div>
              )}
              <hr />
              {pollutionDataArray &&
                pollutionDataArray.map((arr) => {
                  return (
                    <div key={uuid()}>
                      lat = {arr.lat}; lon = {arr.lon}; timestamp ={" "}
                      {arr.timestamp.toString()}; aqi level = {arr.aqi}; no2
                      level = {arr.no2}; o3 level = {arr.o3}; pm10 level ={" "}
                      {arr.pm10}; pm2_5 level = {arr.pm2_5};
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}

export default UserComponent;
