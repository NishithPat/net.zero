import React, { useState, useEffect } from "react";
import { useMoralis } from "react-moralis";
import { useMoralisQuery } from "react-moralis";


function App() {

  const [currentUser, setCurrentUser] = useState("0x0000000000000000000000000000000000000000");
  const { authenticate, logout, isAuthenticated, user } = useMoralis();

  // const lon = "50" // TODO: Enter through textbox in GUI
  // const lat = "50"
  // let { fetch, data, error, isLoading } = useMoralisQuery("LocationEventTable", query =>
  //   query
  //     .equalTo("requester_", "0x95bdd2BD33f95023fAe511e26e4bCc609B3824C5")
  //     .equalTo("lat_", lat)
  //     .equalTo("lon_", lon)
  //     .descending("block_timestamp")
  //     .limit(10),
  //   [],
  //   { autoFetch: false }
  // );

  const lon = "50" // TODO: Enter through textbox in GUI
  const lat = "50"
  let { fetch, data, error, isLoading } = useMoralisQuery("LocationEventTable", query =>
    query
      .equalTo("requester_", currentUser)
      .equalTo("lat_", lat)
      .equalTo("lon_", lon)
      .descending("block_timestamp")
      .limit(10),
    [],
    { autoFetch: false },
  );

  function getuserData() {
    console.log(currentUser);
  }

  function getStats() {
    //fetch();
    console.log(data);
    console.log(error);
  }

  if (!isAuthenticated) {
    return (
      <div>
        <button onClick={authenticate}>Log In</button>
      </div>
    );
  }
  else {
    //console.log(user)
    return (
      <div>
        <h1>Welcome {user.get("ethAddress")}</h1>
        <div><button onClick={() => setCurrentUser(user.get("ethAddress"))}>Set User</button></div>
        <div><button onClick={getuserData}>get user data</button></div>
        {<button onClick={() => fetch()}>fetch</button>}
        <div>{<button onClick={getStats}>get stats</button>}</div>
        <button onClick={() => { logout(); setCurrentUser("0x0000000000000000000000000000000000000000") }}>Log Out</button>
      </div>
    );
  }
}


export default App;
