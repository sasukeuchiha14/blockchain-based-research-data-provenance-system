// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Research Data Provenance
/// @notice Implements an immutable, secure audit trail for research datasets
contract ResearchProvenance {
    struct Dataset {
        string ipfsHash;
        address researcher;
        uint256 timestamp;
        string fileName;
    }

    mapping(uint256 => Dataset) private datasets;
    uint256 public datasetCount;

    event DatasetAdded(uint256 indexed id, string ipfsHash, address indexed researcher, uint256 timestamp, string fileName);

    error EmptyHash();
    error EmptyName();
    error DatasetNotFound();

    /// @notice Adds a new dataset record
    /// @param _ipfsHash The IPFS CID of the dataset
    /// @param _fileName The custom name of the dataset
    function addDataset(string calldata _ipfsHash, string calldata _fileName) external {
        if (bytes(_ipfsHash).length == 0) {
            revert EmptyHash();
        }
        if (bytes(_fileName).length == 0) {
            revert EmptyName();
        }

        datasetCount++;
        datasets[datasetCount] = Dataset({
            ipfsHash: _ipfsHash,
            researcher: msg.sender,
            timestamp: block.timestamp,
            fileName: _fileName
        });

        emit DatasetAdded(datasetCount, _ipfsHash, msg.sender, block.timestamp, _fileName);
    }

    /// @notice Retrieves a dataset record
    /// @param _id The ID of the dataset
    /// @return ipfsHash The IPFS CID
    /// @return researcher The address of the researcher
    /// @return timestamp The time the dataset was added
    /// @return fileName The name of the dataset
    function getDataset(uint256 _id) external view returns (string memory ipfsHash, address researcher, uint256 timestamp, string memory fileName) {
        if (_id == 0 || _id > datasetCount) {
            revert DatasetNotFound();
        }
        
        Dataset storage dataset = datasets[_id];
        return (dataset.ipfsHash, dataset.researcher, dataset.timestamp, dataset.fileName);
    }
}
