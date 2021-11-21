import React from "react";
import { useMoralis } from "react-moralis";
import { useMoralisQuery } from "react-moralis";


function App() {

  const { authenticate, logout ,isAuthenticated, user } = useMoralis();

  //function GetStats (user) {
    const lon = "50" // TODO: Enter through textbox in GUI
    const lat = "50"
    const { data, error, isLoading } = useMoralisQuery("LocationEventTable", query =>
    query
      //.equalTo("requester_", user.get("ethAddress"))
      .equalTo("lat_", lat)
      .equalTo("lon_", lon)
      .descending("block_timestamp")
      .limit(10),
    );
    console.log(data)
  //}
  
  if (!isAuthenticated) {
    return (
      <div>
        <button onClick={authenticate}>Log In</button>
      </div>
    );
  }
  else {
    console.log(user)
    return (
      <div>
        <h1>Welcome {user.get("ethAddress")}</h1>
        <button onClick={logout}>Log Out</button>
        {/*<button onClick={() => GetStats(user)}>Get Stats</button>*/}
      </div>
    );
  }
}


export default App;
