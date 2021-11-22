// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

contract PollutionDataContract is ChainlinkClient, KeeperCompatibleInterface {
    using Chainlink for Chainlink.Request;

    uint256 private counter;

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    uint256 private immutable interval;
    uint256 private lastTimeStamp;

    mapping(bytes32 => address) public toAddresses;
    mapping(bytes32 => string) public toLat;
    mapping(bytes32 => string) public toLon;

    struct locationData {
        address createdBy;
        string lat;
        string lon;
        bytes32 IDOfRequest;
    }

    locationData[] public locationDataArray;

    constructor() {
        setPublicChainlinkToken();
        oracle = 0xd57018342B19Bc74dD6f5Fa8B73c934694b3aC10;
        jobId = "c7ef2e55f68e45b4b98219b8f2854189";
        fee = 0;
        interval = 10 minutes;
        lastTimeStamp = block.timestamp;
    }

    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        upkeepNeeded = (block.timestamp - lastTimeStamp) > interval;
    }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        lastTimeStamp = block.timestamp;
        counter = counter + 1;
        requestMultipleParameters();
    }

    //function -> add to array and requestMultipleParameters
    function addLocationData(string memory _lat, string memory _lon) public {
        locationDataArray.push(locationData(msg.sender, _lat, _lon, 0x0));
    }

    function requestMultipleParameters(string memory _lat, string memory _lon)
        public
        returns (bytes32 requestId)
    {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfillMultipleParameters.selector
        );

        req.add("lat", _lat);
        req.add("lon", _lon);

        // Sends the request
        requestId = sendChainlinkRequestTo(oracle, req, fee);
        toAddresses[requestId] = msg.sender;
        toLat[requestId] = _lat;
        toLon[requestId] = _lon;
    }

    event RequestMultipleFulfilled(
        bytes32 requestId_,
        uint256 aqi_,
        uint256 no2_,
        uint256 o3_,
        uint256 pm10_,
        uint256 pm2_5_,
        address indexed requester_
    );

    event coordinatesAndAddress(
        bytes32 requestId_,
        string lat_,
        string lon_,
        uint256 timestamp_,
        address indexed requester_
    );

    function fulfillMultipleParameters(
        bytes32 requestId,
        uint256 aqi_response,
        uint256 no2_response,
        uint256 o3_response,
        uint256 pm10_response,
        uint256 pm2_5_response
    ) public recordChainlinkFulfillment(requestId) {
        emit RequestMultipleFulfilled(
            requestId,
            aqi_response,
            no2_response,
            o3_response,
            pm10_response,
            pm2_5_response,
            toAddresses[requestId]
        );
        emit coordinatesAndAddress(
            requestId,
            toLat[requestId],
            toLon[requestId],
            block.timestamp,
            toAddresses[requestId]
        );

        //GTAX minted on some condition
        //if(no2 > 200) { mint gtax}
    }

    // function withdrawLink() external {} - Implement a withdraw function to avoid locking your LINK in the contract
}
