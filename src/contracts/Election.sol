pragma solidity ^0.5.16;

contract Election {

    // public variables
    string public name;
    uint public candidatesCount = 0;
    address public owner;
    bool public electionStarted = true;
    mapping(uint => Candidate) public candidates;

    struct Candidate {
        uint id;
        uint votes;
        string name;
        string party;
    }

    event CandidateRegistered (
        uint id,
        string name,
        string party
    );

    event Voted (
        uint targetId
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    function registerCandidate(string memory _name, string memory _party) public {
        // check if election is started
        require(electionStarted, "Election needs to be started in order to vote");

        require(msg.sender == owner, "Only the owner can register candidates");

        // check for valid name and party name
        require(bytes(_name).length > 0, "Candidate name required");
        require(bytes(_party).length > 0, "Party name required");

        // add to list of candidates
        candidates[candidatesCount] = Candidate(candidatesCount, 0, _name, _party);
        candidatesCount ++;

        // trigger event
        emit CandidateRegistered(candidatesCount, _name, _party);
    }

    function vote(uint _id) public {

        // check if election is started
        require(electionStarted, "Election needs to be started in order to vote");

        // check for valid id
        require(_id >= 0 && _id < candidatesCount);

        candidates[_id].votes ++;

        // trigger event
        emit Voted(_id);
    }

    function getCandidate(uint _id) public view returns (string memory, uint) {
        // check for valid id
        require(_id >= 0 && _id < candidatesCount);

        Candidate memory c = candidates[_id];
        return (c.name, c.votes);
    }

    function clearCandidates() public {
    for (uint i = 0; i < candidatesCount; i++) {
        delete candidates[i]; 
    }
    candidatesCount = 0; 
}


    function startElection() public {
        electionStarted = true;
    }

    function endElection() public {
        electionStarted = false;
        clearCandidates();
    }

    constructor () public {
        owner = msg.sender;
        name = "Election";
    }
}