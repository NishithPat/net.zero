// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "./IAqiDatabase.sol";

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
    
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;
    
    address private dbaddr = 0x009AaAa065A9457B0E6d2FFA2Fc38a0268915F4F;
    
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
        IAqiDatabase(dbaddr).addAqiToDb(_aqi);
    }
    
    function getAqiDbLengthWrapper(address _addr) public view returns (uint256) {
        return IAqiDatabase(_addr).getAqiDbLength();
    }
    
    function addAqiToDbWrapper(address _addr, uint256 _aqi) public { 
        IAqiDatabase(_addr).addAqiToDb(_aqi);
    }
    
    // function withdrawLink() external {} - Implement a withdraw function to avoid locking your LINK in the contract
}

