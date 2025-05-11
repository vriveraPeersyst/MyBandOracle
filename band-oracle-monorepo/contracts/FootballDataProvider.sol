// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IBridge {
    function verifyOracleResult(bytes calldata data)
        external
        view
        returns (
            uint64 requestId,
            uint64 ansTime,
            bytes memory result
        );
}

/// @title FootballDataProvider
/// @notice Schedules matchdays, stores kickoff times + results, and integrates with BandChain (push model only)
contract FootballDataProvider is Ownable {
    // Match scheduling
    mapping(uint256 => uint256) public startTime;
    mapping(uint256 => bytes32[]) public matchIDs;

    // Results: matchday => matchID => result
    mapping(uint256 => mapping(bytes32 => bytes32)) private results;

    // Band integration
    IBridge public bridge;
    uint64 public oracleScriptID;
    uint8 public askCount;
    uint8 public minCount;

    event MatchdayScheduled(
        uint256 indexed matchday,
        uint256 startTimestamp,
        bytes32[] fixtures
    );

    event ResultsPublished(
        uint256 indexed matchday,
        bytes32 indexed matchID,
        bytes32 result,
        uint256 timestamp
    );

    event ProofRelayed(
        uint256 indexed matchday,
        bytes proof,
        bytes result
    );

    constructor(
        IBridge _bridge,
        uint64 _oracleScriptID,
        uint8 _askCount,
        uint8 _minCount
    ) Ownable(msg.sender) {
        bridge = _bridge;
        oracleScriptID = _oracleScriptID;
        askCount = _askCount;
        minCount = _minCount;
    }

    function setBridge(IBridge _bridge) external onlyOwner {
        bridge = _bridge;
    }

    /// @notice Schedule a matchday with kickoff times and fixture IDs
    function scheduleMatchday(
        uint256 matchday,
        uint256 ts,
        bytes32[] calldata fixtures
    ) external onlyOwner {
        startTime[matchday] = ts;
        matchIDs[matchday] = fixtures;
        emit MatchdayScheduled(matchday, ts, fixtures);
    }

    /// @notice Publish results for a given matchday after Band proof verification
    function relayProof(
        uint256 matchday,
        bytes calldata proof,
        bytes32[] calldata fixtureIDs,
        bytes32[] calldata outcomes
    ) external onlyOwner {
        require(fixtureIDs.length == outcomes.length, "Length mismatch");

        // Verify proof
        (, , bytes memory result) = bridge.verifyOracleResult(proof);

        // Store results
        for (uint256 i = 0; i < fixtureIDs.length; i++) {
            results[matchday][fixtureIDs[i]] = outcomes[i];
            emit ResultsPublished(matchday, fixtureIDs[i], outcomes[i], block.timestamp);
        }

        emit ProofRelayed(matchday, proof, result);
    }

    /// @notice Returns result for fixture
    function getResult(uint256 matchday, bytes32 id)
        external
        view
        returns (bytes32)
    {
        return results[matchday][id];
    }

    /// @notice Returns kickoff timestamp
    function getStartTime(uint256 matchday) external view returns (uint256) {
        return startTime[matchday];
    }
}
