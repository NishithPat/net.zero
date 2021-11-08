// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./AqiDatabase.sol";

contract LocationHandler {
    
    struct Location {
      string name;
      uint lon;
      uint lat;
      AqiDatabase aqiDatabase;
    }
    Location[] public locations;

    mapping (string => address) public LocationToAddress;

    function mintNewLocation(string memory _name, uint _lon, uint _lat) public {
        //address aqiDbAddr = createAqiDatabase().;
        AqiDatabase aqiDatabase = new AqiDatabase();
        locations.push(Location(_name, _lon, _lat, aqiDatabase));
    } 
    
    //function createAqiDatabase() public returns (address aqiDbAddr) {
    //    AqiDatabase aqiDatabase = new AqiDatabase();
    //    return aqiDatabase;
    //}
}