// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

/*
Contract flow -
Deploy MyToken.sol first. Fetch the address of the deployed MyToken Contract 
and pass it into the parameter of this contract's constructor and click deploy in remix.
Then, in MyToken contract, call the setMinterRole function and pass the address of this contract.
Doing so gives the permission to this contract to mint ERC1155 tokens.
*/

import "https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.8/ChainlinkClient.sol";
import "https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "./MyToken.sol";

contract PollutionDataContract is ChainlinkClient, KeeperCompatibleInterface {
    using Chainlink for Chainlink.Request;

    uint256 public counter;
    uint256 public tokenCounter;

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
    mapping(bytes32 => uint256) public toTokenID;

    mapping(string => mapping(string => uint256)) public locationToTokenID;

    mapping(uint256 => string) public tokenIDToLat;
    mapping(uint256 => string) public tokenIDToLon;

    address public tokenAddr;
    address public creator;

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

    constructor(address _tokenAddr) {
        creator = msg.sender;
        tokenAddr = _tokenAddr;
        setPublicChainlinkToken();
        oracle = 0xd57018342B19Bc74dD6f5Fa8B73c934694b3aC10;
        jobId = "c7ef2e55f68e45b4b98219b8f2854189";
        fee = 0;
        interval = 5 minutes; //needs to change
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

        tokenCounter += 1;
        tokenIDToLat[tokenCounter] = _lat;
        tokenIDToLon[tokenCounter] = _lon;
        locationToTokenID[_lat][_lon] = tokenCounter;

        //mint token initially. Have not decided on who should own these tokens. At this point its just this contract's address
        MyToken(tokenAddr).mint(creator, tokenCounter, 0, "");

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
        toTokenID[requestId] = locationToTokenID[_lat][_lon];
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
        toTokenID[requestId] = locationToTokenID[_lat][_lon];
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

        //GTAX minted on trigger conditions
        uint256 gTaxAmount = 0;

        if (aqi_response > 3) {
            gTaxAmount += 1;
        }
        if (no2_response > 200 * 100000000) {
            gTaxAmount += 1;
        }
        if (o3_response > 180 * 100000000) {
            gTaxAmount += 1;
        }
        if (pm10_response > 90 * 100000000) {
            gTaxAmount += 1;
        }
        if (pm2_5_response > 55 * 100000000) {
            gTaxAmount += 1;
        }

        if (gTaxAmount > 0) {
            MyToken(tokenAddr).mint(
                creator,
                toTokenID[requestId],
                gTaxAmount,
                ""
            );
        }

        counter = counter + 1;
    }

    // function withdrawLink() external {} - Implement a withdraw function to avoid locking your LINK in the contract
}
