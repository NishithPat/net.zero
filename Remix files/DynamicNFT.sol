//for remix
//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import {Base64} from "./libraries/Base64.sol";

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Counters.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract DynamicNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 private totalNumberOfTokens = 0;

    string[] wordsForNFT = ["DANGER", "SAFE", "NEUTRAL"];

    string baseSvg =
        "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='black' /><text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>";

    event NFTMinted(address minter, uint256 tokenNum);

    constructor() ERC721("PollutionNFT", "PolluteNFT") {}

    function makeAnEpicNFT() public {
        require(
            _tokenIds.current() < 100,
            "Only a hundred tokens can be minted"
        );
        uint256 newItemId = _tokenIds.current();

        _safeMint(msg.sender, newItemId);
        changeTokenURI(newItemId, 0);

        totalNumberOfTokens += 1;
        _tokenIds.increment();

        emit NFTMinted(msg.sender, newItemId);
    }

    function changeTokenURI(uint256 tokenId_, uint256 indexOfWord)
        public
        returns (string memory)
    {
        string memory currentWord = wordsForNFT[indexOfWord];

        string memory finalSvg = string(
            abi.encodePacked(baseSvg, currentWord, "</text></svg>")
        );

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        "DataPollution",
                        '", "description": "A collection of nfts for pollution", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(finalSvg)),
                        '"}'
                    )
                )
            )
        );

        string memory finalTokenUri = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        _setTokenURI(tokenId_, finalTokenUri);

        return finalTokenUri;
    }

    function totalTokens() public view returns (uint256) {
        return totalNumberOfTokens;
    }
}
