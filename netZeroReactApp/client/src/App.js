import React, { useState, useEffect } from "react";
import Web3 from "web3";
import uuid from 'react-uuid';
import DummyContractForSophia from "./contracts/DummyContractForSophia.json";

import "./App.css";

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const [aqi, setAQI] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");

  const [aqiArray, setAqiArray] = useState(undefined);
  const [pollutionData, setPollutionData] = useState(undefined);
  const [coordinateData, setCoordinateData] = useState(undefined);

  const connectToWallet = async () => {
    try {
      console.log("connected!");

      const web3Instance = await getWeb3Obj();
      console.log(web3Instance);

      const accountsInstance = await web3Instance.eth.getAccounts();

      const networkId = await web3Instance.eth.net.getId();
      const deployedNetwork = DummyContractForSophia.networks[networkId];

      console.log("contract address on the network", deployedNetwork.address);

      const instance = new web3Instance.eth.Contract(
        DummyContractForSophia.abi,
        deployedNetwork && deployedNetwork.address,
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
  }

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
      const provider = new Web3.providers.HttpProvider(
        "http://127.0.0.1:8545"
      );
      const web3 = new Web3(provider);
      console.log("No web3 instance injected, using Local web3.");
      return web3;
    }
  }

  const listenMMAccount = async (web3Obj) => {
    window.ethereum.on("accountsChanged", async () => {
      // Time to reload your interface with accounts[0]!
      const accountsInstance = await web3Obj.eth.getAccounts();
      // accounts = await web3.eth.getAccounts();
      console.log(accountsInstance);
      setAccounts(accountsInstance);

      if (accountsInstance.length === 0) {
        setConnected(false);
      }
    });
  }

  const setEventListener = (contractInstance, _accounts) => {
    console.log(contractInstance._address, "from event listener");
    contractInstance.events.RequestMultipleFulfilled({ filter: { requester_: _accounts[0] } })
      .on("data", function (event) {
        let data = event.returnValues;

        console.log(data);
        //setAQI(aqiLevel.aqi);
        alert(`the aqi value of the requested location is ${data.aqi_}`)
      })
  }

  // const fetchAQIValue = async () => {
  //   const returnedAQIValue = await contract.methods.aqiValue().call();
  //   console.log(returnedAQIValue);
  //   setAQI(returnedAQIValue);
  // }

  const lattitudeFunction = async (event) => {
    console.log(event.target.value);
    setLat(event.target.value);
  }

  const longitudeFunction = async (event) => {
    console.log(event.target.value);
    setLon(event.target.value);
  }

  const RequestFunction = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      await contract.methods.requestMultipleParameters(lat, lon).send({ from: accounts[0] });
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
    setLon("");
    setLat("");
  }

  const gettingPastEvents = () => {

    let returnPollutionValuesFromPastEvents = [];
    contract.getPastEvents("RequestMultipleFulfilled", { fromBlock: 1, filter: { requester_: accounts[0] } })
      .then(function (events) {
        //console.log(events);
        events.forEach(event => {
          returnPollutionValuesFromPastEvents.push({
            aqi: event.returnValues.aqi_,
            no2: event.returnValues.no2_ / 10 ** 8,
            o3: event.returnValues.o3_ / 10 ** 8,
            pm10: event.returnValues.pm10_ / 10 ** 8,
            pm2_5: event.returnValues.pm2_5_ / 10 ** 8
          })
        })
        console.log(returnPollutionValuesFromPastEvents);
        setPollutionData(returnPollutionValuesFromPastEvents)
      });

    const returnCoordinateValuesFromPastEvents = [];
    contract.getPastEvents("coordinatesAndAddress", { fromBlock: 1, filter: { requester_: accounts[0] } })
      .then(function (events) {
        //console.log(events);
        events.forEach(event => {
          returnCoordinateValuesFromPastEvents.push({
            lat: event.returnValues.lat_,
            lon: event.returnValues.lon_
          })
        })
        console.log(returnCoordinateValuesFromPastEvents);
        setCoordinateData(returnCoordinateValuesFromPastEvents);
      });

  }

  const consolefunc = () => {
    let coordinates = coordinateData;
    let pollutant = pollutionData;

    for (let i = 0; i < pollutant.length; i++) {
      pollutant[i].lat = coordinates[i].lat;
      pollutant[i].lon = coordinates[i].lon;
    }

    console.log(pollutant);
    setAqiArray(pollutant);
  }

  // async function chainchange(web3Obj) {
  //   window.ethereum.on("chainChanged", async () => {
  //     const networkId = await web3Obj.eth.net.getId();
  //     const deployedNetwork = Hello.networks[networkId];

  //     console.log(deployedNetwork.address);

  //     const instance = new web3Obj.eth.Contract(
  //       Hello.abi,
  //       deployedNetwork && deployedNetwork.address,
  //     );

  //     setContract(instance);
  //   })
  // }

  return (
    <>
      <div className="App">
        <div>
          <p>{connected && <b>account address: {accounts[0]}</b>}</p>
          {!connected && <button onClick={connectToWallet}>Connect</button>}
          <p>{connected && <b>address of the deployed contract: {contract._address}</b>}</p>
        </div>
        {/*connected && <div>
          {<button onClick={fetchAQIValue}>AQI value</button>}
          <p>aqi value = {aqi}</p>
        </div>*/}
        {connected && <div>
          <form onSubmit={RequestFunction}>
            <label htmlFor="lattitude">Lattitude</label>
            <input id="lattitude" value={lat} onChange={lattitudeFunction} />
            <label htmlFor="longitude">Longitude</label>
            <input id="longitude" value={lon} onChange={longitudeFunction} />
            <button type="submit">request data</button>
          </form>
        </div>}
        <b>{loading && "...loading"}</b>

        {connected && <div>
          <button onClick={gettingPastEvents}>Get Past Events</button>
          <button onClick={consolefunc}>Show data</button>
          <div>
            {aqiArray && aqiArray.map(arr => {
              return (
                <div key={uuid()}>
                  lat = {arr.lat};
                  lon = {arr.lon};
                  aqi level = {arr.aqi};
                  no2 level = {arr.no2};
                  o3 level = {arr.o3};
                  pm10 level = {arr.pm10};
                  pm2_5 level = {arr.pm2_5}
                </div>
              )
            })}
          </div>
        </div>}
      </div>
    </>
  )
}

export default App;
