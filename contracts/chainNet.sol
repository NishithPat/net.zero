// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts@4.3.2/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts@4.3.2/access/Ownable.sol";
import "@openzeppelin/contracts@4.3.2/security/Pausable.sol";
import "@openzeppelin/contracts@4.3.2/token/ERC1155/extensions/ERC1155Burnable.sol";

contract NFTContract is ERC1155, Ownable {
    
    uint256 public constant TriggerPoint = 0;
    uint256 public constant GreenTax = 1;

   constructor() ERC1155("") {
       _mint(msg.sender, TriggerPoint, 1,"");
       _mint(msg.sender, GreenTax, 2,"");
   }
   
   function mint(address account, uint256 id, uint256 amount) public onlyOwner {
       _mint(account, id, amount,"");
   }
   
   function burn(address account, uint256 id, uint256 amount) public {
       require(msg.sender == account);
       _burn(account, id, amount);
   }
}
