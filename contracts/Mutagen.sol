// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";

contract Mutagen is Initializable, ERC721Upgradeable, ERC721EnumerableUpgradeable, ERC721URIStorageUpgradeable, OwnableUpgradeable, UUPSUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _tokenIdCounter;
    mapping(string => uint256) public _name_to_id;
    mapping(string => uint256) public _collectionBalances; //collection to balance
    mapping(string => mapping(uint256 => uint256)) public _collectionTokens; //collection to token
    mapping(uint256 => string) public _index_to_collection;
    mapping(uint256 => string) _uris;

    event Payment(uint256 price, string name, uint256 item, string message);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize() initializer public {
        __ERC721_init("mutagen", "MGN");
        __ERC721Enumerable_init();
        __ERC721URIStorage_init();
        __Ownable_init();
        //itemToken = this;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://";
    }

    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    /**
     * @dev Private function to add a token to this extension's ownership-tracking data structures.
     * @param collection string representing the new collection of the given token ID
     * @param tokenId uint256 ID of the token to be added to the tokens list of the given address
     */
    function _addTokenToCollectionEnumeration(string memory collection, uint256 tokenId) private {
        _collectionBalances[collection] += 1;
        _collectionTokens[collection][_collectionBalances[collection]] = tokenId;
        _index_to_collection[tokenId] = collection;
    }

     /**
     * @dev Private function to remove a token from this contracts's collection-tracking data structures.
     * This has O(1) time complexity, but alters the order of the _ownedTokens array.
     * @param collection string representing the collection
     * @param tokenId uint256 ID of the token to be removed from the tokens list of the given collection
     */
    function _removeTokenFromCollectionEnumeration(string memory collection, uint256 tokenId) private {
        delete _index_to_collection[tokenId];
        delete _collectionTokens[collection][_collectionBalances[collection]];
    }


    /**
     * @dev pays an owner of a token, emitting an event
     * @param _item The id of an existing item
     * @param _amount the wei amount
     */
    function pay(uint256 _item, uint256 _amount, string memory _memo) public payable virtual {
        uint256 fee = _amount/100;
        payable(ownerOf(_item)).transfer(_amount-fee);
        payable(owner()).transfer(fee);
        emit Payment(_amount, tokenURI(_item), _item, _memo);
    }

    /**
     * @dev pays a swagtag owner, emitting an event
     * @param _name The name of an existing item
     * @param _amount the wei amount
     */
    function payName(string memory _name, uint256 _amount, string memory _memo) public payable virtual {
        uint256 _item =  _name_to_id[_name];
        uint256 fee = _amount/100;
        payable(ownerOf(_item)).transfer(_amount-fee);
        payable(owner()).transfer(fee);
        emit Payment(_amount, tokenURI(_item), _item, _memo);
    }

    /**
     * @dev mint a fresh swagtag
     * @param _name the swagtag name
     */
    function mintToken(string memory _name, string memory _url, string memory _collection)
        public
        returns (uint256)
    {
        _tokenIdCounter.increment();
        require( !(_name_to_id[_name]>0), "Token already exists" );
        uint256 newItemId = _tokenIdCounter.current();
        _mint(msg.sender, newItemId);
        _id_to_name[newItemId] = _name;
        _uris[newItemId] = _url;
        _index_to_collection[newItemId] = _collection;
        _addTokenToCollectionEnumeration(_collection, newItemId);
        _name_to_id[_name] = newItemId;
        //payable(owner()).transfer(10000000000000000);
        return newItemId;
    }    

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 _tokenId)
        internal
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
    {
        super._burn(_tokenId);
        string memory _name = _id_to_name[_tokenId];
        if (_name_to_id[_name] != 0) {
            delete _id_to_name[_tokenId];
            delete _name_to_id[_name];
            delete _uris[_tokenId];
        }
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return _uris[tokenId];//super.tokenURI(tokenId);
    }

    /**
     */
    function tokenOfCollectionByIndex(string memory collection, uint256 index) public view virtual returns (uint256) {
        require(index < _collectionBalances[collection], "Collection: index out of bounds");
        return _collectionTokens[collection][index];
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }


    function setAddress(string memory _name, string memory _address)
        public
    {
        require(ownerOf(_name_to_id[_name]) == msg.sender, "Only the owner can do this");
        _uris[_name_to_id[_name]] = _address;
    }


    function getId(string memory _name)
        public
        view
        returns(uint256 id)
    {
        return _name_to_id[_name];
    }

    function getData(string memory _name)
        public
        view
        returns(string memory)
    {
        return tokenURI(_name_to_id[_name]);
    }

    function getCollectionData(string memory _collection, uint256 _index)
        public
        view
        returns(string memory)
    {
        return tokenURI(_collectionTokens[_collection][_index]);
    }

    function getName(uint256 tokenId)
        public
        view
        returns(string memory)
    {
        return tokenURI(tokenId);
    }

    mapping(uint256 => string) public _id_to_name;

    function getNameForId(uint256 _tokenId)
        public
        view
        returns(string memory)
    {
        return _id_to_name[_tokenId];
    }

}
