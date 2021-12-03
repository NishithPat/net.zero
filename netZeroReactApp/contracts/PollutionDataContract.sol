// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

contract PollutionDataContract is ChainlinkClient, KeeperCompatibleInterface {
    using Chainlink for Chainlink.Request;

    uint256 public counter;

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    uint256 private immutable interval;
    uint256 private lastTimeStamp;

    string[] public latArray;
    string[] public lonArray;
    address[] public creatorArray;

    mapping(bytes32 => address) public toAddresses;
    mapping(bytes32 => string) public toLat;
    mapping(bytes32 => string) public toLon;

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

    constructor() {
        setPublicChainlinkToken();
        oracle = 0x0f0B6651D8b9DF518915FE0728E7A633dCf17351;
        jobId = "6f58b95c65154b6798215d33f329c20c";
        fee = 0;
        interval = 15 minutes; //needs to change
        lastTimeStamp = block.timestamp;
    }

    //function -> add to array and requestMultipleParameters
    function addLocationDataAndFetchPollutionData(
        string memory _lat,
        string memory _lon
    ) public {
        latArray.push(_lat);
        lonArray.push(_lon);
        creatorArray.push(msg.sender);
        requestMultipleParametersFromUser(_lat, _lon, msg.sender);
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
        counter = counter + 1;

        lastTimeStamp = block.timestamp;

        if (counter >= creatorArray.length) {
            counter = 0;
        }

        string memory _lat = latArray[counter];
        string memory _lon = lonArray[counter];

        requestMultipleParameters(_lat, _lon);
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

        toLat[requestId] = latArray[counter];
        toLon[requestId] = lonArray[counter];
        toAddresses[requestId] = creatorArray[counter];
    }

    function requestMultipleParametersFromUser(
        string memory _lat,
        string memory _lon,
        address _sender
    ) public returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfillMultipleParameters.selector
        );

        req.add("lat", _lat);
        req.add("lon", _lon);

        // Sends the request
        requestId = sendChainlinkRequestTo(oracle, req, fee);
        toLat[requestId] = _lat;
        toLon[requestId] = _lon;
        toAddresses[requestId] = _sender;
    }

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
        //if(no2_response > 200) { mint gtax}
    }

    // function withdrawLink() external {} - Implement a withdraw function to avoid locking your LINK in the contract
}
