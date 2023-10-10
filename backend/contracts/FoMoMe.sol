// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/*
Disclaimer: 
Participation in FoMoMe implies your acknowledgment and acceptance of the following terms: no responsibility is held by the contract creator, the contract is unaudited, and participants play at their own risk.

Submission for Alchemy University Ethereum Developer Bootcamp
*/

contract FoMoMe is ReentrancyGuard {
    using EnumerableSet for EnumerableSet.AddressSet;

    address public owner;
    uint256 public minimumDuration;
    uint256 public extension;
    uint256 public minEntryPrice;
    
    struct Game {
        uint256 deadline;
        uint256 price;
        uint256 prize;
        address lastParticipant;
        uint8 status; // 0 - N/A, 1 - Ongoing, 2 - Ended/Claimed
    }
    
    mapping(address => mapping(uint256 => Game)) public games;
    mapping(address => uint256) public counter;

    EnumerableSet.AddressSet private activeHosts;

    event Started(address indexed host, uint256 deadline, uint256 entryPrice);
    event Joined(address indexed player, address host, uint256 entryAmount, uint256 newDeadline);
    event Winner(address indexed player, address host, uint256 count, uint256 reward);

    constructor() {
        owner = msg.sender;
        minimumDuration = 60 minutes;
        minEntryPrice = 1e16;
        extension = 10 minutes;
    }

    function start(uint256 _entryPrice) external payable {
        address host = msg.sender;
        uint256 _n = counter[host];
        require(games[host][_n].status == 0, "End the previous game first");
        require(msg.value >= _entryPrice, "Pay the entry price");
        require(_entryPrice >= minEntryPrice, "Entry price at least 0.01 ETH");
        games[host][_n] = Game(block.timestamp + minimumDuration, _entryPrice, msg.value, host, 1);
        activeHosts.add(host);
        emit Started(host, block.timestamp + minimumDuration, _entryPrice);
    }

    function join(address _host) external payable {
        uint256 _n = counter[_host];
        Game storage game = games[_host][_n];
        require(game.status == 1, "No game yet");
        require(block.timestamp < game.deadline, "The game is over");
        require(msg.value >= game.price, "Entry price not met");
        game.prize += msg.value;
        game.lastParticipant = msg.sender;
        game.deadline += (msg.value / game.price) * extension;
        emit Joined(msg.sender, _host, msg.value, game.deadline);
    }

    function conclude(address _host) external nonReentrant {
        uint256 _n = counter[_host];
        Game storage game = games[_host][_n];
        require(block.timestamp > game.deadline, "The game is not over yet");
        require(game.status == 1, "No game yet");
        uint256 reward = game.prize / 100 * 95;
        uint256 executeReward = game.prize / 100 * 3;
        uint256 creatorReward = game.prize / 100 * 1;
        uint256 tax = game.prize / 100 * 1;
        counter[_host]++;
        activeHosts.remove(_host);
        payable(game.lastParticipant).transfer(reward);
        payable(msg.sender).transfer(executeReward);
        payable(_host).transfer(creatorReward);
        payable(owner).transfer(tax);
        emit Winner(game.lastParticipant, _host, _n, reward);
    }

    function getActiveHosts() public view returns (address[] memory) {
        return activeHosts.values();
    }

    function getActiveGame(address _host) public view returns (Game memory game) {
        uint256 _n = counter[_host];
        game = games[_host][_n];
    }

    function getGame(address _host, uint256 _n) public view returns (Game memory game) {
        game = games[_host][_n];
    }
    // receive() external payable {}
}
