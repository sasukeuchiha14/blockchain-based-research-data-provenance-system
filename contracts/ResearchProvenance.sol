// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Research Data Provenance
/// @notice Implements an immutable, secure audit trail for research datasets
contract ResearchProvenance {
    struct Dataset {
        string ipfsHash;
        address researcher;
        uint256 timestamp;
    }

    mapping(uint256 => Dataset) private datasets;
    uint256 public datasetCount;

    event DatasetAdded(uint256 indexed id, string ipfsHash, address indexed researcher, uint256 timestamp);

    error EmptyHash();
    error DatasetNotFound();

    /// @notice Adds a new dataset record
    /// @param _ipfsHash The IPFS CID of the dataset
    function addDataset(string calldata _ipfsHash) external {
        if (bytes(_ipfsHash).length == 0) {
            revert EmptyHash();
        }

        datasetCount++;
        datasets[datasetCount] = Dataset({
            ipfsHash: _ipfsHash,
            researcher: msg.sender,
            timestamp: block.timestamp
        });

        emit DatasetAdded(datasetCount, _ipfsHash, msg.sender, block.timestamp);
    }

    /// @notice Retrieves a dataset record
    /// @param _id The ID of the dataset
    /// @return ipfsHash The IPFS CID
    /// @return researcher The address of the researcher
    /// @return timestamp The time the dataset was added
    function getDataset(uint256 _id) external view returns (string memory ipfsHash, address researcher, uint256 timestamp) {
        if (_id == 0 || _id > datasetCount) {
            revert DatasetNotFound();
        }
        
        Dataset storage dataset = datasets[_id];
        return (dataset.ipfsHash, dataset.researcher, dataset.timestamp);
    }
}
