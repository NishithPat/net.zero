// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

contract DummyContractForSophia is ChainlinkClient {
    using Chainlink for Chainlink.Request;

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    uint256 public immutable interval;
    uint256 public lastTimeStamp;

    mapping(bytes32 => address) public toAddresses;

    event requestFulfilled(address indexed to, uint256 aqi);

    constructor() {
        setPublicChainlinkToken();
        oracle = 0x5221E61ccb134Af38a7360c23a29A2345cEb3027;
        jobId = "70e8c0b52fdc45ecabbfc816e73aba10";
        fee = 0; // (Varies by network and job) //zero in this instance
        interval = 1 minutes;
        lastTimeStamp = block.timestamp;
    }

    function requestVolumeData(string memory _lat, string memory _lon)
        public
        returns (bytes32 requestId)
    {
        Chainlink.Request memory request = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfill.selector
        );

        request.add("lat", _lat);
        request.add("lon", _lon);

        // Sends the request
        requestId = sendChainlinkRequestTo(oracle, request, fee);
        toAddresses[requestId] = msg.sender;
    }

    /**
     * Receive the response in the form of uint256
     */
    function fulfill(bytes32 _requestId, uint256 _aqiValue)
        public
        recordChainlinkFulfillment(_requestId)
    {
        emit requestFulfilled(toAddresses[_requestId], _aqiValue);
    }

    // function withdrawLink() external {} - Implement a withdraw function to avoid locking your LINK in the contract
}
