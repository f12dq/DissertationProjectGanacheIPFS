// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract DataStorage is AccessControl {
    using ECDSA for bytes32;

    struct Data {
        string name;
        string contentHash; // Store the IPFS content hash instead of the file content
        uint256 timestamp;
        address owner;
        address[] authorizedUsers;
        bytes32 transactionHash;
    }

    mapping(uint256 => Data) private dataMap;
    mapping(uint256 => mapping(address => bool)) private authorizedUsersMap;
    uint256 private dataCount;
    event DataShared(uint256 indexed id, address indexed recipient);
    event DataRevoked(uint256 indexed id, address indexed recipient);
    event DataAccessed(uint256 indexed id, address indexed user);
    event DataStored(uint256 indexed id, string name, uint256 timestamp, address owner);

    modifier onlyOwner(uint256 _id) {
        require(msg.sender == dataMap[_id].owner, "Only data owner can perform this action");
        _;
    }

    modifier onlyAuthorizedUser(uint256 _id) {
        require(authorizedUsersMap[_id][msg.sender], "You are not authorized to access this data");
        _;
    }

     function storeData(string memory _name, string memory _contentHash) public {
     dataCount++;
     Data storage newData = dataMap[dataCount];
     newData.name = _name;
     newData.contentHash = _contentHash;
     newData.timestamp = block.timestamp;
     newData.owner = msg.sender;
     emit DataStored(dataCount, _name, block.timestamp, msg.sender);
    }


    function shareData(uint256 _id, address _recipient) public onlyOwner(_id) {
        require(_recipient != address(0), "Invalid recipient address");
        require(!authorizedUsersMap[_id][_recipient], "Recipient already has access to data");

        Data storage data = dataMap[_id];
        data.authorizedUsers.push(_recipient);
        authorizedUsersMap[_id][_recipient] = true;
        emit DataShared(_id, _recipient);
    }

    function revokeDataAccess(uint256 _id, address _recipient) public onlyOwner(_id) {
        require(authorizedUsersMap[_id][_recipient], "Recipient does not have access to data");

        Data storage data = dataMap[_id];
        address[] storage authorizedUsers = data.authorizedUsers;
        for (uint256 i = 0; i < authorizedUsers.length; i++) {
            if (authorizedUsers[i] == _recipient) {
                authorizedUsers[i] = authorizedUsers[authorizedUsers.length - 1];
                authorizedUsers.pop();
                break;
            }
        }
        authorizedUsersMap[_id][_recipient] = false;
        emit DataRevoked(_id, _recipient);
    }

    function accessData(uint256 _id) public onlyAuthorizedUser(_id) {
        emit DataAccessed(_id, msg.sender);
    }

    function getData(uint256 _id) public view returns (string memory, uint256, address) {
        require(_id > 0 && _id <= dataCount, "Invalid data ID");
        Data storage data = dataMap[_id];
        return (data.name, data.timestamp, data.owner);
    }

    function getContentHash(uint256 _id) public view onlyAuthorizedUser(_id) returns (string memory) {
        Data storage data = dataMap[_id];
        return data.contentHash;
    }

    function verifySignature(uint256 _id, bytes memory _signature) internal view returns (address) {
        bytes32 messageHash = keccak256(abi.encodePacked(address(this), _id));
        return messageHash.recover(_signature);
    }
}
