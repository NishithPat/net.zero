//TOML-Multiple-response-0-fees

//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

contract MultiWordConsumer is ChainlinkClient {
    using Chainlink for Chainlink.Request;

    uint256 public aqi;
    uint256 public no2;
    uint256 public o3;
    uint256 public pm10;
    uint256 public pm2_5;

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    constructor() {
        setPublicChainlinkToken();
        oracle = 0xd57018342B19Bc74dD6f5Fa8B73c934694b3aC10;
        jobId = "c7ef2e55f68e45b4b98219b8f2854189";
        fee = 0;
    }

    function requestMultipleParameters(string memory _lat, string memory _lon)
        public
    {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfillMultipleParameters.selector
        );

        req.add("lat", _lat);
        req.add("lon", _lon);

        sendChainlinkRequestTo(oracle, req, fee);
    }

    event RequestMultipleFulfilled(
        bytes32 requestId,
        uint256 aqi_,
        uint256 no2_,
        uint256 o3_,
        uint256 pm10_,
        uint256 pm2_5_
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
            pm2_5_response
        );
        aqi = aqi_response;
        no2 = no2_response;
        o3 = o3_response;
        pm10 = pm10_response;
        pm2_5 = pm2_5_response;
    }
}
