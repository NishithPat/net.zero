// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

/**
 * Request testnet LINK and ETH here: https://faucets.chain.link/
 * Find information on LINK Token Contracts and get the latest ETH and LINK faucets here: https://docs.chain.link/docs/link-token-contracts/
 */

/**
 * THIS IS AN EXAMPLE CONTRACT WHICH USES HARDCODED VALUES FOR CLARITY.
 * PLEASE DO NOT USE THIS CODE IN PRODUCTION.
 */
contract APIConsumer is ChainlinkClient {
    using Chainlink for Chainlink.Request;
  
    uint256 public requestedAqi;
    uint256 [] aqiArray;
    
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;
    
    /**
     * Network: Kovan
     * Oracle: 0xc57B33452b4F7BB189bB5AfaE9cc4aBa1f7a4FD8 (Chainlink Devrel   
     * Node)
     * Job ID: d5270d1c311941d0b08bead21fea7747
     * Fee: 0.1 LINK
     */
    constructor() {
        setPublicChainlinkToken();
        oracle = 0xc57B33452b4F7BB189bB5AfaE9cc4aBa1f7a4FD8;
        jobId = "d5270d1c311941d0b08bead21fea7747";
        fee = 0.1 * 10 ** 18; // (Varies by network and job)
    }
    
    /**
     * Create a Chainlink request to retrieve API response, and find the target data
     */
    function requestAqiDataTrigger() public returns (bytes32 requestId) 
    {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        
        // Set the URL to perform the GET request on
        request.add("get", "https://api.openweathermap.org/data/2.5/air_pollution?lat=50&lon=50&appid=e6c99c4bc75882b1f2d0f9b35f2f118a");
        
        // Set the path to find the desired data in the API response, where the response format is:
        // "list": [
        //  {
        //      "main": {
        //          "aqi": 1
        //      }
        request.add("path", "list.0.main.aqi");
        
        // Sends the request
        return sendChainlinkRequestTo(oracle, request, fee);
    }
    
    /**
     * Receive the response in the form of uint256
     */ 
    function fulfill(bytes32 _requestId, uint256 _aqi) public recordChainlinkFulfillment(_requestId)
    {
        requestedAqi = _aqi;
        addAqiToDb(_aqi);
    }
    
    // TODO: outsource the database functions to another contract
    function addAqiToDb(uint256 _aqi) internal {
        aqiArray.push(_aqi);
    }
    
    function getAqiFromDbByIndex(uint _index) public view returns (uint256) {
        return aqiArray[_index];
    }
    
    function getLastAqiFromDb() public view returns (uint256) {
        return aqiArray[getAqiDbLength() - 1];
    }
    
    function getAqiDbLength() public view returns (uint256) {
        return aqiArray.length;
    }
    
    function fillAqiDbWithDummyValues() public {
        for (uint256 val = 1; val < 6; val++) {
            aqiArray.push(val);
        }
    }
    
    

    // function withdrawLink() external {} - Implement a withdraw function to avoid locking your LINK in the contract
}
